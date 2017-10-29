function initializeAuthListener() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            if (!newUser) {
                window.location.href = "catalog.html";
            } else {
                createNewUser(user.uid);
            }
        }
    });
}


$(document).ready(function () {
    console.log("Initialized!");
    initializeAuthListener();
});

function openLoginModal() {
    $('.navbar-toggler').click();
    $('#loginModal').modal({
        keyboard: false
    })
    $('#loginModal').modal('show');
}