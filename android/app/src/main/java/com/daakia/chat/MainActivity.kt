package com.daakia.chat

import android.content.res.Configuration
import android.os.Bundle
import android.view.KeyEvent
import androidx.core.view.WindowCompat
import com.mattermost.hardware.keyboard.MattermostHardwareKeyboardImpl
import com.mattermost.rnutils.helpers.FoldableObserver
import com.reactnativenavigation.NavigationActivity

class MainActivity : NavigationActivity() {
    private var HWKeyboardConnected = false
    private val foldableObserver = FoldableObserver.getInstance(this)
    private var lastOrientation: Int = Configuration.ORIENTATION_UNDEFINED


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(null)
        setContentView(R.layout.launch_screen)
        setHWKeyboardConnected()
        lastOrientation = this.resources.configuration.orientation
        foldableObserver.onCreate()
        WindowCompat.setDecorFitsSystemWindows(window, false)
    }

    override fun onStart() {
        super.onStart()
        foldableObserver.onStart()
    }

    override fun onStop() {
        super.onStop()
        foldableObserver.onStop()
    }

    override fun onDestroy() {
        super.onDestroy()
        foldableObserver.onDestroy()
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        val newOrientation = newConfig.orientation
        if (newOrientation != lastOrientation) {
            lastOrientation = newOrientation
            foldableObserver.handleWindowLayoutInfo()
        }
        if (newConfig.hardKeyboardHidden == Configuration.HARDKEYBOARDHIDDEN_NO) {
            HWKeyboardConnected = true
        } else if (newConfig.hardKeyboardHidden == Configuration.HARDKEYBOARDHIDDEN_YES) {
            HWKeyboardConnected = false
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
    }

    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        if (HWKeyboardConnected) {
            val ok = MattermostHardwareKeyboardImpl.dispatchKeyEvent(event)
            if (ok) {
                return true
            }
        }
        return super.dispatchKeyEvent(event)
    }

    private fun setHWKeyboardConnected() {
        HWKeyboardConnected = getResources().configuration.keyboard == Configuration.KEYBOARD_QWERTY
    }
}
