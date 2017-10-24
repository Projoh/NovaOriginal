// function initializeFireBase() {
//     var config = {
//         apiKey: "AIzaSyDa1pFV63C-8OpQEZMHMx70EFIdO59PVzI",
//         authDomain: "nova-medical-technologies.firebaseapp.com",
//         databaseURL: "https://nova-medical-technologies.firebaseio.com",
//         projectId: "nova-medical-technologies",
//         storageBucket: "",
//         messagingSenderId: "315237263721"
//     };
//     firebase.initializeApp(config);
// }
//
// function initializeAuthListener() {
//     firebase.auth().onAuthStateChanged(function(user) {
//         if (user) {
//             // window.location.href = "admin.html";
//         } else {
//             // No user is signed in.
//         }
//     });
// }
//
// $( document ).ready(function() {
//     console.log( "Initialized!" );
//
//     initializeFireBase();
//     //initializeAuthListener();
// });
//


// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Initialize Firebase
var config = {
    apiKey: "AIzaSyDa1pFV63C-8OpQEZMHMx70EFIdO59PVzI",
    authDomain: "nova-medical-technologies.firebaseapp.com",
    databaseURL: "https://nova-medical-technologies.firebaseio.com",
    projectId: "nova-medical-technologies",
    storageBucket: "",
    messagingSenderId: "315237263721"
};
firebase.initializeApp(config);

// Place any jQuery/helper plugins in here.
