function initializeFireBase() {
    var config = {
        apiKey: "AIzaSyDa1pFV63C-8OpQEZMHMx70EFIdO59PVzI",
        authDomain: "nova-medical-technologies.firebaseapp.com",
        databaseURL: "https://nova-medical-technologies.firebaseio.com",
        projectId: "nova-medical-technologies",
        storageBucket: "",
        messagingSenderId: "315237263721"
    };
    firebase.initializeApp(config);
}

function initializeAuthListener() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
             window.location.href = "catalog.html";
        } else {
            // No user is signed in.
        }
    });
}

$( document ).ready(function() {
    console.log( "Initialized!" );

    initializeFireBase();
    initializeAuthListener();
});