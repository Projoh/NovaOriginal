function initializeAuthListener() {
    firebase.auth().onAuthStateChanged(function(user) {
        if(user){
            if (user.uid == 'Dx0MdFm8ajSyn0DRkzvPU3PzljF2') {
                return;
            }
        }
        window.location.href = "index.html";
    });
}


$( document ).ready(function() {
    console.log( "Initialized!" );
    // Pull approved users
    initializeAuthListener();
});

function showContent(content) {
    var containerToShow = $('#'+content+'-container');
    var anchorToHighlight = $('#anchor-'+content);

    var allContainers = $('#all-containers').children("div");
    allContainers.each(function () {
        var container = $(this);
        $(container).removeClass('gone');
        $(container).addClass('gone');
    });
    var allAnchors = $('#nav-bar').find( "a" );
    allAnchors.each(function () {
        var anchor = $(this);
        $(anchor).removeClass("bg-dark text-white")
    });

    anchorToHighlight.addClass("bg-dark text-white");
    $(containerToShow).removeClass('gone');
}

function logOut() {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
    }).catch(function(error) {
        // An error happened.
    });
}