/* Author: J.Dunmire
 *
 * Based on the example at 
 * http://www.chipchapin.com/WebTools/JavaScript/example1-02.html
 *
 */
function addLastModified() {
  lastmod = document.lastModified;
  lastmoddate = Date.parse(lastmod);
  if (lastmoddate == 0) {
    $('#lastModified').html("Last Modified: Unknown");
    //document.writeln("Last Modified: Unknown");
  } else {
    $('#lastModified').html("Last Modified: "+ lastmod);
    //document.writeln("Last Modified: " + lastmod);
  }
}
