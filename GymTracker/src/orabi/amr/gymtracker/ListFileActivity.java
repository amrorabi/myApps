package orabi.amr.gymtracker;

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import android.app.ListActivity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.webkit.MimeTypeMap;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.Toast;

public class ListFileActivity extends ListActivity {

	private String path;

	  @Override
	  protected void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    setContentView(R.layout.activity_list_files);

	    // Use the current directory as title
	    path = "/sdcard/";
	    if (getIntent().hasExtra("path")) {
	      path = getIntent().getStringExtra("path");
	    }
	    setTitle(path);

	    // Read all files sorted into the values-array
	    List values = new ArrayList();
	    File dir = new File(path);
	    if (!dir.canRead()) {
	      setTitle(getTitle() + " (inaccessible)");
	    }
	    String[] list = dir.list();
	    if (list != null) {
	      for (String file : list) {
	        if (!file.startsWith(".")) {
	          values.add(file);
	        }
	      }
	    }
	    Collections.sort(values);

	    // Put the data into the list
	    ArrayAdapter adapter = new ArrayAdapter(this,
	        android.R.layout.simple_list_item_2, android.R.id.text1, values);
	    setListAdapter(adapter);
	  }

	  @Override
	  protected void onListItemClick(ListView l, View v, int position, long id) {
	    String filename = (String) getListAdapter().getItem(position);
	    if (path.endsWith(File.separator)) {
	      filename = path + filename;
	    } else {
	      filename = path + File.separator + filename;
	    }
	    File file = new File(filename);
	    
	    if (file.isDirectory()) {
	      Intent intent = new Intent(this, ListFileActivity.class);
	      intent.putExtra("path", filename);
	      startActivityForResult(intent, 2);
	    }
	    else {
	    	String extension = MimeTypeMap.getFileExtensionFromUrl(filename);
	    	String mimetype = MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension);
	    	if( ! mimetype.startsWith("image")){
	    		Log.e("file type is: ", mimetype);
	    		Toast.makeText(this, filename + " is not a image", Toast.LENGTH_LONG).show();
	    	}
	    	else{
	    		Intent i = new Intent();
	    		i.putExtra("photoPath", filename);
	    		setResult(RESULT_OK, i);
	    		finish();
	    	}
	    }
	  }
	  
	  @Override
		protected void onActivityResult(int requestCode, int resultCode, Intent data) {
			super.onActivityResult(requestCode, resultCode, data);
			setResult(resultCode, data);
			finish();
	  }
}
