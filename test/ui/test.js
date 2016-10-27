var page = require("webpage").create();

page.open("https://github.com/kashira2339/filednd", function(status) {
  if (status === "success") {
    page.render("github-repository.png");
  }
  
  phantom.exit();
});
