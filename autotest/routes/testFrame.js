/*
 * GET users listing.
 */

function testFrame(req, res) {
  console.log("req = " + req);
  res.render('home', {
    layout : 'main2',
    title : 'Express Handlebars'
  });
}

exports.testFrame = testFrame;