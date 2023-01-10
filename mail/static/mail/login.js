document.addEventListener('DOMContentLoaded', function () {

    document.querySelector('#login_submit').onsubmit = function () {

        // ¬х≥д ≥ створенн€ локального сховища
        var email = document.querySelector('#login_email').value;
        var password = document.querySelector('#login_password').value;

        if (!email) {
            alert('Input email please!');
            return false;
        }

        if (!password) {
            alert('Input password please!');
            return false;
        }

        localStorage.setItem('currentUser', email);

        var currentUser = localStorage.getItem('currentUser');
        console.log(currentUser);

        return true;
    };
});
