document.addEventListener('DOMContentLoaded', function () {

    console.log('inside!');

    document.querySelector('#register-form').onsubmit = function () {

        console.log('submitted!');

        var email = document.querySelector('#register-email').value;
        var password = document.querySelector('#register-password').value;
        var confirmation = document.querySelector('#register-confirmation').value;

        if (!email) {
            alert('Input email please!');
            return false;
        }

        if (!password) {
            alert('Input password please!');
            return false;
        }

        if (!confirmation) {
            alert('Input confirmation please!');
            return false;
        }

        if (password != confirmation) {
            alert('The paswword is not the same!');
            return false;
        }

        return true;
    };
})
