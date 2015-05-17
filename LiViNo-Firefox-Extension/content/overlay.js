var FILE_PATH = "/tmp/vndump.html";

var fileLastModified = 0;
var fileLastSize = 0;
var refreshRate = 100; //

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

var LiViNo = {

  onLoad: function() {
    // Initialization code
    this.initialized = true;
	
	LiViNo.timer();
  },
  
  // Periodically refreshes the LiViNo tab
  timer: function () {
    window.setTimeout(LiViNo.timer, refreshRate);	
	LiViNo.findTabAndRefresh();
  },
  
  findTabAndRefresh: function () {

    // Checks all tabs
	var numTabs = gBrowser.browsers.length;

    for (var index = 0; index < numTabs; index++) {
        var currentBrowser = gBrowser.getBrowserAtIndex(index);
        var url = currentBrowser.currentURI.spec;
		
		var ios = Cc["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
        var uri = ios.newURI(url, null, null);
		
		var foundTab = false;
		if (uri.scheme == 'file' ) { //It's a local file
			fileUrl = uri.QueryInterface(Ci.nsIFileURL);
			if (fileUrl.file.path.toString() == FILE_PATH.toString()) { //It's our file!
				foundTab = true;

				var livinoFile = Components.classes["@mozilla.org/file/local;1"].
				        createInstance(Components.interfaces.nsILocalFile);
				livinoFile.initWithPath(FILE_PATH);
				
				if (!livinoFile.exists()) break;
				
				var newModifiedTime = livinoFile.lastModifiedTime;
				var newSize = livinoFile.fileSize;
				
				if (newModifiedTime > fileLastModified || newSize != fileLastSize ) {
					//alert("File modified! ");
					fileLastModified = newModifiedTime;
					fileLastSize = newSize;
					
					// Refresh page
					var tab = gBrowser.tabContainer.childNodes[index];
					
					// Immediate refresh
                    //LiViNo.reloadTab(tab);
					
					// Just in case, allow Wine 50ms to dump the complete string
					setTimeout(function(){LiViNo.reloadTab(tab)}, 50);
				}				
			}			
		}		
		if (foundTab) {
			refreshRate = 100;
			//alert("Found!");
		} else {
			refreshRate = 3000;
			//alert("Not Found!");
		}		
	}
  },
  
  reloadTab: function( theTab ) {
	gBrowser.reloadTab( theTab );
  },
	
  onMenuItemCommand: function() {
    // Just open the HTML dump file
	gBrowser.selectedTab = gBrowser.addTab("file://" + FILE_PATH); 
  }
};

window.addEventListener("load", function(e) { LiViNo.onLoad(e); }, false); 
