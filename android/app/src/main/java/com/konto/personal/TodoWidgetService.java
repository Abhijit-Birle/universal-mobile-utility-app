package com.konto.personal;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class TodoWidgetService extends RemoteViewsService {
    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        return new TodoRemoteViewsFactory(this.getApplicationContext());
    }
}

class TodoRemoteViewsFactory implements RemoteViewsService.RemoteViewsFactory {
    private Context context;
    private List<TodoItem> todoItems = new ArrayList<>();

    public TodoRemoteViewsFactory(Context context) {
        this.context = context;
    }

    @Override
    public void onCreate() {
        loadData();
    }

    @Override
    public void onDataSetChanged() {
        loadData();
    }

    private void loadData() {
        todoItems.clear();
        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String tasksJson = prefs.getString("widget_tasks", "[]");
        
        try {
            JSONArray array = new JSONArray(tasksJson);
            for (int i = 0; i < array.length(); i++) {
                JSONObject obj = array.getJSONObject(i);
                TodoItem item = new TodoItem();
                item.id = obj.optLong("id");
                item.text = obj.optString("text", "Unknown Task");
                item.done = obj.optBoolean("done", false);
                todoItems.add(item);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onDestroy() {
        todoItems.clear();
    }

    @Override
    public int getCount() {
        return todoItems.size();
    }

    @Override
    public RemoteViews getViewAt(int position) {
        if (position >= todoItems.size()) return null;

        TodoItem item = todoItems.get(position);
        RemoteViews rv = new RemoteViews(context.getPackageName(), R.layout.widget_todo_item);
        
        rv.setTextViewText(R.id.item_text, item.text);
        
        if (item.done) {
            rv.setImageViewResource(R.id.item_icon, android.R.drawable.checkbox_on_background);
        } else {
            rv.setImageViewResource(R.id.item_icon, android.R.drawable.checkbox_off_background);
        }

        Intent fillInIntent = new Intent();
        fillInIntent.putExtra("TAB", "todo");
        rv.setOnClickFillInIntent(R.id.item_text, fillInIntent);

        return rv;
    }

    @Override
    public RemoteViews getLoadingView() {
        return null;
    }

    @Override
    public int getViewTypeCount() {
        return 1;
    }

    @Override
    public long getItemId(int position) {
        return position;
    }

    @Override
    public boolean hasStableIds() {
        return true;
    }

    private static class TodoItem {
        long id;
        String text;
        boolean done;
    }
}
