document.addEventListener('DOMContentLoaded', function () {

    //Використовуйте кнопки для перемикання між переглядами
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);
    document.querySelector('#logout').addEventListener('click', logout);

    //За замовчуванням завантажувати вхідні
    load_mailbox('inbox');
});


// Надсилання листів
function compose_email() {

    //Зупинити надсилання форми
    document.getElementById("compose-form").addEventListener("submit", function (event) {
        event.preventDefault();
    });

    // Показати подання створення та приховати інші подання
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#email-body').style.display = 'none';

    // Сховати кнопки електронної пошти
    document.querySelector('#ansver').style.display = 'none';
    document.querySelector('#archivation_group').style.display = 'none';

    // Очистіть поля композиції
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';

    // Якщо форму подано
    document.querySelector('#compose-form').onsubmit = function () {

        // Отримання даних від користувача
        var recipients = document.querySelector('#compose-recipients').value;
        if (!recipients) {
            alert('You have to put at least one recipient!!!');
            return false;
        }

        var subject = document.querySelector('#compose-subject').value;
        var body = document.querySelector('#compose-body').value;

        // Надсилання даних та отримання відповіді
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: recipients,
                subject: subject,
                body: body
            })
        })
            .then(response => response.json())
            .then(result => {
                console.log(result);
                alert(result.message);
                if (result.message == undefined) {
                    alert(result.error);
                    return false;
                }

                // За замовчуванням завантажувати вхідні
                load_mailbox('sent');

                // У разі успіху - надсилання форми
                document.getElementById("compose-form").requestSubmit("submit");
            });
    }
}


// Отримання списку листів
function load_mailbox(mailbox) {

    // отримання всіх листів для нашої поштової скриньки
    fetch(`/emails/${mailbox}`)
        .then(response => response.json())
        .then(emails => {

            // Якщо поштової скриньки не існує
            if (emails.error) {
                alert(emails.error);
                console.log(mailbox);
                console.log(emails.error);
                return false;
            }

            // Зроблення порожнього власника електронної пошти
            document.querySelector('#email-body').innerHTML = '';

            // Показати поштову скриньку та приховати інші види
            document.querySelector('#emails-view').style.display = 'block';
            document.querySelector('#compose-view').style.display = 'none';
            document.querySelector('#email-body').style.display = 'none';

            // Сховати кнопки електронної пошти
            document.querySelector('#ansver').style.display = 'none';
            if (mailbox == 'inbox') {
                document.querySelector('#archivation_group').style.display = 'block';
                document.querySelector('#archivation_group').innerHTML = 'Add emails to the archive';
            } else if (mailbox == 'archive') {
                document.querySelector('#archivation_group').style.display = 'block';
                document.querySelector('#archivation_group').innerHTML = 'Get emails out of the archive';
            } else {
                document.querySelector('#archivation_group').style.display = 'none';
            }

            // Показати назву поштової скриньки
            document.querySelector('#header').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

            // Зробити список електронних листів порожнім перед завантаженням листів
            document.querySelector('#emails-view').innerHTML = [];

            // Створення списку данних 
            const emailsList = document.querySelector('#emails-view');

            // Наповнення поштової скриньки листами
            for (email of emails) {

                // Створення нового елемента для кожного листа та заповнення його електронною поштою
                const div = document.createElement('div');
                const input = document.createElement('input');
                const button = document.createElement('button');
                const table = document.createElement('table');
                const td1 = document.createElement('td');
                const td2 = document.createElement('td');
                const td3 = document.createElement('td');
                const td4 = document.createElement('td');

                // Заповнення прапорця
                input.type = 'checkbox';
                input.id = email.id;

                console.log(input);

                // Заповнення кнопки
                if (mailbox == 'inbox') {
                    if (email.read === true) {
                        button.style.backgroundColor = 'grey';
                    } else {
                        button.style.backgroundColor = 'white';
                    }
                } else if (mailbox == 'sent') {
                    button.style.backgroundColor = 'grey';
                } else {
                    if (email.read === true) {
                        button.style.backgroundColor = 'grey';
                    } else {
                        button.style.backgroundColor = 'white';
                    }
                }
                button.name = email.id;

                console.log(button);

                // Заповнення таблиці-елементів
                td1.innerHTML = `<b>Sent: ${email.sender}</b>;`;
                td2.innerHTML = `<b>Reciived by: ${email.recipients[0]}</b>;`;
                td3.innerHTML = `Subject: ${email.subject}`;
                td4.innerHTML = `(${email.timestamp})`;

                // Додавання всіх елементів таблиці до таблиці та таблиці до кнопки
                table.append(td1);
                table.append(td2);
                table.append(td3);
                table.append(td4);
                button.append(table);

                // Додавання кожної кнопки та прапорця до div
                div.append(input);
                div.append(button);

                // Додавання кожного div до списку
                emailsList.append(div);
            }

            // Дзвінок для отримання листа з нашої поштової скриньки
            email_onload();

            // Виклик функції групового архіву
            group_archive();
        })
}


// Функція отримання листа з нашої поштової скриньки
function email_onload() {

    // Показати вибраний email
    const container = document.querySelector('#emails-view');
    const buttons = container.querySelectorAll('button');

    console.log(container);
    console.log(buttons);

    buttons.forEach(function (button) {
        button.onclick = function () {
            fetch(`/emails/${button.name}`)
                .then(response => response.json())
                .then(email => {

                    // Якщо такої електронної пошти не існує
                    if (email.error) {
                        alert(email.error);
                        console.log(email);
                        console.log(email.error);
                        return false;
                    }

                    console.log("DOWNLOADED!!!");
                    console.log(email);
                    console.log(email.error);

                    // Показати електронну пошту та приховати інші перегляди
                    document.querySelector('#compose-view').style.display = 'none';
                    document.querySelector('#email-body').style.display = 'block';

                    // Показувати кнопку відповіді та кнопку архівації, якщо користувач є одержувачем
                    document.querySelector('#ansver').style.display = 'block';
                    document.querySelector('#archivation_group').style.display = 'block';

                    // Додати в архів Видалити з архіву кнопки
                    const recipients = email.recipients;
                    const currentUser = localStorage.getItem('currentUser');

                    console.log(recipients);

                    for (recipient of recipients) {

                        console.log(email.user);
                        console.log(currentUser);

                        if (currentUser == recipient) {
                            if (email.archived == true) {
                                document.querySelector('#archivation_group').innerHTML = 'Get email out of the archive';
                            } else {
                                document.querySelector('#archivation_group').innerHTML = 'Add email to the archive';
                            }
                        }
                    }

                    // Оформлення листа з позначкою прочитаного
                    fetch(`/emails/${email.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            read: true
                        })
                    })

                    console.log(email);

                    document.querySelector('#email-body').innerHTML =
                        `<h4>${email.subject}</h4><br> Sender: ${email.sender},<br> Recipients: ${email.recipients},<br> ${email.timestamp}.<br> ${email.body}`;

                    // Приховати перегляд електронних листів
                    document.querySelector('#emails-view').style.display = 'none';

                    // Виклик функції Додавання до архіву/Вилучення з архіву
                    document.querySelector('#archivation_group').onclick = function () {

                        console.log(email.archived);

                        archive(email);

                        console.log(email);
                        console.log(email.archived);

                        // Завантажте вхідні
                        if (email.archived == false) {
                            load_mailbox('archive');
                        } else {
                            load_mailbox('inbox');
                        }
                    }

                    // Виклик функції відповіді
                    answer(email);
                });
        }
    });
}


// Функція додавання в архів/видалення з архіву
function archive(email) {
    if (email.archived == true) {

        // Додавання листа до архіву
        fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: false
            })
        })
    } else {

        // Додавання листа до архіву
        fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: true
            })
        })
    }
}


// Отримання функції відповіді
function answer(email) {
    document.querySelector('#ansver').onclick = function () {

        // Створіть нові заповнювачі літер
        const newRecipient = email.sender;
        const newSubject = email.subject;
        const newBody = email.body;
        const newTimestampt = email.timestamp;

        // Переспрямування до нової форми створення електронної пошти
        compose_email();
        document.querySelector('#compose-recipients').value = newRecipient;
        document.querySelector('#compose-subject').value = 'Re: ' + newSubject;
        document.querySelector('#compose-body').value = `On ${newTimestampt} ${newRecipient} wrote ${newBody}`;
    }
}


// Функція групового архіву
function group_archive() {

    // Підготовка вибраного списку електронних адрес до архівації
    const readyToArchive = [];

    console.log(readyToArchive);

    // Заповнення вибраного списку електронних адрес для архівації листами
    const container = document.querySelector('#emails-view');
    container.querySelectorAll('input').forEach(function (input) {
        input.onclick = function () {
            fetch(`/emails/${input.id}`)
                .then(response => response.json())
                .then(email => {
                    console.log(input.id);
                    console.log(email);

                    if (readyToArchive.length != 0) {
                        for (let i = 0, n = readyToArchive.length; i < n; i++) {
                            let checkedMail = readyToArchive[i];
                            if (checkedMail.id == email.id) {
                                readyToArchive.splice(i, 1);
                                break;
                            } else if (checkedMail.id != email.id && i == n - 1) {
                                readyToArchive.push(email);
                            } else {
                                continue;
                            }
                        }
                    } else {
                        readyToArchive.push(email);
                    }

                    console.log(readyToArchive);
                });
        }
    });

    // Архівація виділених елементів
    document.querySelector('#archivation_group').onclick = function () {

        if (readyToArchive.length == 0) {
            alert('You have to choose at least one email for achivation!!!');
            return false;
        }

        console.log('ARCHIVING');

        var emailsArchived;

        for (email of readyToArchive) {
            console.log(email);
            console.log(emailsArchived);

            archive(email);
            emailsArchived = email.archived;

            console.log(email);
            console.log(emailsArchived);
        }

        // Завантажте вхідні
        if (emailsArchived == false) {
            load_mailbox('archive');
        } else {
            load_mailbox('inbox');
        }

    };
}


// Вийдіть із системи та видалітьItem із localStorage
function logout() {
    localStorage.removeItem('currentUser');
    var currentUser = localStorage.getItem('currentUser');
    console.log(currentUser);
}