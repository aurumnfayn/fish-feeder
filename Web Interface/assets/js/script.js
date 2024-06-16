import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, get, onValue, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBhkztzpa-3BTTMIJ4JoMoRpHPL-YGKG-U",
    authDomain: "fishfeeder-ac3fc.firebaseapp.com",
    databaseURL: "https://fishfeeder-ac3fc-default-rtdb.firebaseio.com",
    projectId: "fishfeeder-ac3fc",
    storageBucket: "fishfeeder-ac3fc.appspot.com",
    messagingSenderId: "869859675147",
    appId: "1:869859675147:web:7c93a08a155b0fd9f98b0e"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

/*  clock */
const hours = document.querySelector('.hours');
const minutes = document.querySelector('.minutes');
const seconds = document.querySelector('.seconds');

const clock = () => {
    let today = new Date();
    let h = today.getHours() % 12 + today.getMinutes() / 59; // 22 % 12 = 10pm
    let m = today.getMinutes(); // 0 - 59
    let s = today.getSeconds(); // 0 - 59

    h *= 30; // 12 * 30 = 360deg
    m *= 6;
    s *= 6; // 60 * 6 = 360deg

    rotation(hours, h);
    rotation(minutes, m);
    rotation(seconds, s);

    // call every second
    setTimeout(clock, 500);
};

const rotation = (target, val) => {
    target.style.transform = `rotate(${val}deg)`;
};

window.onload = clock;

window.toggleDiv = function() {
    $('.components').toggle();
    $('.components2').toggle();
}

let count = 0;
const countRef = ref(database, 'count');
onValue(countRef, (snapshot) => {
    count = snapshot.val();
    console.log(count);
});

window.feednow = function() {
    update(ref(database), {
        feednow: 1
    });
}

$(document).ready(function() {
    $('#timepicker').mdtimepicker(); //Initializes the time picker
    addDiv();
});

$('#timepicker').mdtimepicker().on('timechanged', function(e) {
    console.log(e.time);
    addStore(count, e);
    count = count + 1;
    update(ref(database), {
        count: count,
    });
});

window.addStore = function(count, e) {
    set(ref(database, 'timers/timer' + count), {
        time: e.time
    });
    addDiv();
}

window.showShort = function(id) {
    var idv = $(id)[0]['id'];
    $("#time_" + idv).toggle();
    $("#short_" + idv).toggle();
}

window.removeDiv = function(id) {
    var idv = $(id)[0]['id'];
    set(ref(database, 'timers/' + idv), null);
    if (count >= 0) {
        count = count - 1;
    }

    update(ref(database), {
        count: count,
    });
    $(id).fadeOut(1, 0).fadeTo(500, 0);
}

window.addDiv = function() {
    const divRef = ref(database, 'timers');
    onValue(divRef, (snapshot) => {
        var obj = snapshot.val();
        var i = 0;
        $('#wrapper').html('');
        while (i <= count) {
            var propertyValues = Object.entries(obj);
            let ts = propertyValues[i][1]['time'];
            var H = +ts.substr(0, 2);
            var h = (H % 12) || 12;
            h = (h < 10) ? ("0" + h) : h; // leading 0 at the left for 1 digit hours
            var ampm = H < 12 ? " AM" : " PM";
            ts = h + ts.substr(2, 3) + ampm;
            console.log(ts);

            const x = `
            <div id=${propertyValues[i][0]}>
                <div class="btn2 btn__secondary2" onclick=showShort(${propertyValues[i][0]}) id="main_${propertyValues[i][0]}">
                <div id="time_${propertyValues[i][0]}">
                ${ts}
                </div>
                <div class="icon2" id="short_${propertyValues[i][0]}" onclick=removeDiv(${propertyValues[i][0]})>
                    <div class="icon__add">
                        <ion-icon name="trash"></ion-icon>
                    </div>
                </div>
                </div>
            </div>`;
            $('#wrapper').append(x);
            i++;
        }
    });
}
