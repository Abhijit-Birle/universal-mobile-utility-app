package com.konto.personal;

import android.content.Intent;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onResume() {
        super.onResume();
        Intent intent = getIntent();
        if (intent != null && intent.hasExtra("TAB")) {
            String tab = intent.getStringExtra("TAB");
            if (this.bridge != null && this.bridge.getWebView() != null) {
                // Force the tab in local storage so the web app picks it up
                String script = "window.localStorage.setItem('neo_activeTab', '\"" + tab + "\"'); " +
                                "window.dispatchEvent(new Event('storage'));";
                this.bridge.getWebView().evaluateJavascript(script, null);
                intent.removeExtra("TAB");
            }
        }
    }
}
