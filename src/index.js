import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const vLifeAccessKey = '059zZmWOYJU0bLf7RrjnLMPbfCYf3uve5KYGs8o3jWxYE1bBQoz5ZKKVafsn';
let tkn = null;

class User {
    constructor(yourJSON) {
        let usr = (JSON.parse(yourJSON)).user;
        Object.assign(this, usr);
    }
}
class Token {
    constructor(yourJSON) {
        const parsedToken = JSON.parse(yourJSON).token;
        if (!tkn && parsedToken) tkn = parsedToken.value;
        return tkn;
    }

    static get value() {
        return tkn;
    }

    static remove() {
        tkn = null;
    }
}
class Event {
    constructor(yourJSON) {
        let evt = JSON.parse(yourJSON);
        Object.assign(this, evt);
    }
}
class Validator {
    // стандартные валидаторы, возможны дочерние классы на отдельные формы

    static validateEmail(mail) {
        // language=JSRegexp,
        //
        // только 1 собака,
        // перед собакой, после нее и после первой точки любые символы
        return mail.match(/@/g).length === 1
            && mail.match(/.+@.+\..+/g).length === 1
    }
    static validatePassword(password) {
        return password.length > 8
    }
}

class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            emailIsValid: "",
            passwordIsValid: "",
            formIsValid: true
        };
        this.changeState = this.changeState.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.changeMail = this.changeMail.bind(this);
        this.changePassword = this.changePassword.bind(this);
    }
    changeState(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }
    changeMail() {
        this.changeState();
        this.state.emailIsValid = Validator.validateEmail(this.state.email);
        this.state.formIsValid = this.state.emailIsValid && this.state.passwordIsValid;
    }
    changePassword() {
        this.changeState();
        this.state.passwordIsValid = Validator.validatePassword(this.state.password);
        this.state.formIsValid = this.state.emailIsValid && this.state.passwordIsValid;
    }
    handleSubmit(event) {
        event.preventDefault();
        let xhr = new XMLHttpRequest();

        const body = {
            password: this.state.password,
            email: this.state.email
        };
        const query = 'http://vlife.lastshelter.net:1337/api/v1/user/login';
        xhr.open('POST', query, true);
        xhr.setRequestHeader('vlife-access-key', vLifeAccessKey);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onload = function() {
            if (xhr.status !== 200) {
                alert(xhr.statusText + ": "+ xhr.responseText);
                return;
            }

            new Token(xhr.responseText);
        };
        xhr.onerror = function() {
            alert( xhr.statusText + ": "+ xhr.responseText );
        };

        xhr.send(JSON.stringify(body));
        return false;
    }

    render() {
        return (
            <form>
                <label>
                    Email: <br />
                    <input
                        name="email"
                        type="text"
                        value={this.state.email}
                        onChange={this.changeState}
                        style={this.state.emailIsValid ? {} : {background: '#fc9d9d'}}/>
                </label>
                <br /> <br />
                <label>
                    Password: <br/>
                    <input
                        name="password"
                        type="password"
                        value={this.state.password}
                        onChange={this.changeState}
                        style={this.state.emailIsValid ? {} : {background: '#fc9d9d'}}/>
                </label>
                <br /> <br />
                <button onClick={this.handleSubmit}
                        disabled={!this.state.formIsValid}>
                    Submit
                </button>
            </form>
        );
    }
}

ReactDOM.render(
    <LoginForm />,
    document.getElementById('root')
);



function createXHR(type, query) {
    const XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
    let xhr = new XHR();

    xhr.open(type, query, true);

    const token = Token.value;

    xhr.setRequestHeader('vlife-access-key', vLifeAccessKey);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('auth-token', token);

    return xhr;
}
