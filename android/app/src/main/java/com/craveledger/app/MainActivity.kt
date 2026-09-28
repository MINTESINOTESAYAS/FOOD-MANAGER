package com.craveledger.app

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import com.google.android.gms.auth.api.identity.AuthorizationRequest
import com.google.android.gms.auth.api.identity.Identity
import com.google.android.gms.common.api.Scope
import org.json.JSONObject
import java.io.ByteArrayInputStream
import java.nio.charset.StandardCharsets

/**
 * Offline-first Android host for Crave Ledger. The interface is served from an
 * app-local HTTPS origin; workspace data stays in WebView DOM storage, with
 * optional Google sign-in and direct Google Sheets backup over the network.
 */
class MainActivity : Activity() {
    private lateinit var webView: WebView
    private var pendingFileCallback: ValueCallback<Array<Uri>>? = null
    private var pendingBackupContents: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(true)
        }
        window.statusBarColor = Color.rgb(251, 249, 246)
        window.navigationBarColor = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Color.rgb(251, 249, 246)
        } else {
            Color.rgb(48, 35, 31)
        }
        @Suppress("DEPRECATION")
        run {
            val lightNavigationBar = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
            } else {
                0
            }
            window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR or lightNavigationBar
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            window.isNavigationBarContrastEnforced = false
        }

        webView = WebView(this).apply {
            setBackgroundColor(Color.rgb(251, 249, 246))
            overScrollMode = View.OVER_SCROLL_NEVER
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.databaseEnabled = true
            settings.allowFileAccess = false
            settings.allowContentAccess = true
            addJavascriptInterface(NativeBridge(), "Android")
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(
                    view: WebView?,
                    request: WebResourceRequest?
                ): Boolean {
                    val uri = request?.url ?: return false
                    if (uri.scheme == "https" && uri.host != "appassets.androidplatform.net") {
                        return try {
                            startActivity(Intent(Intent.ACTION_VIEW, uri))
                            true
                        } catch (_: Exception) {
                            false
                        }
                    }
                    return false
                }

                override fun shouldInterceptRequest(
                    view: WebView?,
                    request: WebResourceRequest?
                ): WebResourceResponse? {
                    val uri: Uri = request?.url ?: return null
                    if (uri.scheme != "https" || uri.host != "appassets.androidplatform.net") return null
                    val assetPath = uri.path?.removePrefix("/assets/") ?: return null
                    val mimeType = when (assetPath) {
                        "index.html" -> "text/html"
                        "styles.css" -> "text/css"
                        "app.js", "google-config.js", "google-sheets.js" -> "text/javascript"
                        "food/beyaynetu.jpg", "food/shiro.jpg", "food/tibs.jpg", "food/kitfo.jpg" -> "image/jpeg"
                        else -> if (assetPath.startsWith("fonts/") && assetPath.endsWith(".woff2")) "font/woff2" else return emptyResponse()
                    }
                    return try {
                        val textEncoding = if (mimeType.startsWith("text/")) "UTF-8" else null
                        WebResourceResponse(mimeType, textEncoding, this@MainActivity.assets.open(assetPath))
                    } catch (_: Exception) {
                        emptyResponse()
                    }
                }
            }
            webChromeClient = object : WebChromeClient() {
                override fun onShowFileChooser(
                    view: WebView?,
                    filePathCallback: ValueCallback<Array<Uri>>?,
                    fileChooserParams: WebChromeClient.FileChooserParams?
                ): Boolean {
                    if (filePathCallback == null) return false
                    pendingFileCallback?.onReceiveValue(null)
                    pendingFileCallback = filePathCallback
                    val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                        addCategory(Intent.CATEGORY_OPENABLE)
                        type = "application/json"
                    }
                    return try {
                        startActivityForResult(intent, IMPORT_REQUEST_CODE)
                        true
                    } catch (_: Exception) {
                        pendingFileCallback?.onReceiveValue(null)
                        pendingFileCallback = null
                        false
                    }
                }
            }
            loadUrl("https://appassets.androidplatform.net/assets/index.html")
        }
        setContentView(webView)
    }

    private fun emptyResponse(): WebResourceResponse =
        WebResourceResponse("text/plain", "UTF-8", ByteArrayInputStream(ByteArray(0)))

    private fun beginGoogleAuthorization() {
        val requestedScopes = listOf(
            Scope("openid"),
            Scope("https://www.googleapis.com/auth/userinfo.email"),
            Scope("https://www.googleapis.com/auth/userinfo.profile"),
            Scope("https://www.googleapis.com/auth/drive.file"),
        )
        val request = AuthorizationRequest.builder()
            .setRequestedScopes(requestedScopes)
            .build()
        Identity.getAuthorizationClient(this)
            .authorize(request)
            .addOnSuccessListener { result ->
                if (result.hasResolution()) {
                    try {
                        val pendingIntent = result.pendingIntent
                            ?: throw IllegalStateException("Google did not provide an authorization prompt.")
                        startIntentSenderForResult(
                            pendingIntent.intentSender,
                            GOOGLE_AUTH_REQUEST_CODE,
                            null,
                            0,
                            0,
                            0,
                        )
                    } catch (error: Exception) {
                        deliverGoogleAuthorizationResult(error = error.message ?: "Could not open Google authorization.")
                    }
                } else {
                    deliverGoogleAuthorizationResult(accessToken = result.accessToken)
                }
            }
            .addOnFailureListener { error ->
                deliverGoogleAuthorizationResult(error = error.message ?: "Google sign-in failed. Please try again.")
            }
    }

    private fun deliverGoogleAuthorizationResult(accessToken: String? = null, error: String? = null) {
        val payload = JSONObject()
        if (!error.isNullOrBlank() || accessToken.isNullOrBlank()) {
            payload.put("error", error ?: "Google did not return an access token. Please try again.")
        } else {
            payload.put("accessToken", accessToken)
            payload.put("expiresIn", 3600)
        }
        val safePayload = JSONObject.quote(payload.toString())
        if (::webView.isInitialized) {
            webView.post {
                webView.evaluateJavascript(
                    "window.craveGoogleAuthorizationResult && window.craveGoogleAuthorizationResult($safePayload);",
                    null,
                )
            }
        }
    }

    private inner class NativeBridge {
        @JavascriptInterface
        fun authorizeGoogleSheets() {
            runOnUiThread { beginGoogleAuthorization() }
        }

        @JavascriptInterface
        fun saveBackup(filename: String, contents: String) {
            runOnUiThread {
                pendingBackupContents = contents
                val safeFilename = filename.substringAfterLast('/').substringAfterLast('\\')
                val intent = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "application/json"
                    putExtra(Intent.EXTRA_TITLE, safeFilename)
                }
                try {
                    startActivityForResult(intent, EXPORT_REQUEST_CODE)
                } catch (_: Exception) {
                    pendingBackupContents = null
                    Toast.makeText(this@MainActivity, "No file location is available.", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    @Deprecated("File picker results use the activity result API in newer Android versions")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        when (requestCode) {
            GOOGLE_AUTH_REQUEST_CODE -> {
                if (resultCode == RESULT_OK && data != null) {
                    try {
                        val result = Identity.getAuthorizationClient(this).getAuthorizationResultFromIntent(data)
                        deliverGoogleAuthorizationResult(accessToken = result.accessToken)
                    } catch (error: Exception) {
                        deliverGoogleAuthorizationResult(error = error.message ?: "Could not finish Google authorization.")
                    }
                } else {
                    deliverGoogleAuthorizationResult(error = "Google sign-in was cancelled.")
                }
            }
            IMPORT_REQUEST_CODE -> {
                val selectedFile = if (resultCode == RESULT_OK) data?.data else null
                val result = selectedFile?.let { arrayOf(it) }
                pendingFileCallback?.onReceiveValue(result)
                pendingFileCallback = null
            }
            EXPORT_REQUEST_CODE -> {
                val destination = if (resultCode == RESULT_OK) data?.data else null
                val contents = pendingBackupContents
                pendingBackupContents = null
                if (destination != null && contents != null) {
                    try {
                        contentResolver.openOutputStream(destination)?.use { output ->
                            output.write(contents.toByteArray(StandardCharsets.UTF_8))
                        } ?: throw IllegalStateException("Could not open the selected file location.")
                        Toast.makeText(this, "Crave Ledger backup saved.", Toast.LENGTH_LONG).show()
                    } catch (_: Exception) {
                        Toast.makeText(this, "Could not save the backup.", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }

    @Deprecated("Deprecated by Android in favor of the predictive back dispatcher")
    override fun onBackPressed() {
        if (::webView.isInitialized && webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    private companion object {
        const val GOOGLE_AUTH_REQUEST_CODE = 9100
        const val IMPORT_REQUEST_CODE = 9101
        const val EXPORT_REQUEST_CODE = 9102
    }
}
