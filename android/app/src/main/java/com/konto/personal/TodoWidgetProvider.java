package com.konto.personal;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.widget.RemoteViews;

public class TodoWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            Intent intent = new Intent(context, TodoWidgetService.class);
            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
            intent.setData(Uri.parse(intent.toUri(Intent.URI_INTENT_SCHEME)));

            RemoteViews rv = new RemoteViews(context.getPackageName(), R.layout.widget_todo);
            rv.setRemoteAdapter(R.id.widget_list_view, intent);
            rv.setEmptyView(R.id.widget_list_view, R.id.widget_empty_view);

            // Intent to launch the app to the Timer tab
            Intent appIntent = new Intent(context, MainActivity.class);
            appIntent.putExtra("TAB", "timer");
            PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, appIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            rv.setOnClickPendingIntent(R.id.btn_timer, pendingIntent);

            // Intent template for list items to launch the app
            Intent listIntent = new Intent(context, MainActivity.class);
            PendingIntent listPendingIntent = PendingIntent.getActivity(context, 1, listIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE);
            rv.setPendingIntentTemplate(R.id.widget_list_view, listPendingIntent);

            appWidgetManager.updateAppWidget(appWidgetId, rv);
        }
        super.onUpdate(context, appWidgetManager, appWidgetIds);
    }
}
