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
    static validators = {
        email: (val) => val.match(/@/g)
                     && val.match(/@/g).length === 1
                     && val.match(/.+@.+\..+/g)
                     && val.match(/.+@.+\..+/g).length === 1,
        password: (val) => val.length > 8
    };
    static validate(prop, value) {
        return Validator.validators[prop](value);
    }
}

class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: ""
        };
        this.changeState = this.changeState.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    changeState(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });

        if (Validator.validate(name, value)) {
            target.style.backgroundColor = '#fff';
        } else {
            target.style.backgroundColor = '#fc6262';
        }
    }
    handleSubmit(event) {
        event.preventDefault();
        for (let key in this.state) {
            if (!this.state.hasOwnProperty(key)) continue;

            if (Validator.validate(key, this.state[key])) continue;
            return;
        }

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
                        onChange={this.changeState} />
                </label>
                <br /> <br />
                <label>
                    Password: <br/>
                    <input
                        name="password"
                        type="password"
                        value={this.state.password}
                        onChange={this.changeState} />
                </label>
                <br /> <br />
                <button onClick={this.handleSubmit}>
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
