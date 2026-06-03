const COGNITO_CONFIG = {
    userPoolId: "ap-southeast-1_2tL2Hsvf7",
    clientId: "5314f5bupep5hodmr9hhoidg4b",
    domain: "https://kart-ecommerce.auth.ap-southeast-1.amazoncognito.com",
    redirectUri: "https://dx4o02gcthxe4.cloudfront.net/"
};

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

let cognitoUser = null;

function getPoolData() {
    return {
        UserPoolId: COGNITO_CONFIG.userPoolId,
        ClientId: COGNITO_CONFIG.clientId
    };
}

function getUserPool() {
    return new AmazonCognitoIdentity.CognitoUserPool(getPoolData());
}

function showAuthError(message) {
    const errorEl = document.getElementById("authError");
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = "block";
    }
}

function showAuthSuccess(message) {
    const successEl = document.getElementById("authSuccess");
    if (successEl) {
        successEl.textContent = message;
        successEl.style.display = "block";
    }
}

function clearAuthMessages() {
    const errorEl = document.getElementById("authError");
    const successEl = document.getElementById("authSuccess");
    if (errorEl) errorEl.style.display = "none";
    if (successEl) successEl.style.display = "none";
}

function handleCustomSignup() {
    clearAuthMessages();
    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value.trim();

    if (!email || !password) {
        showAuthError("Please enter both email and password.");
        return;
    }

    if (email.toLowerCase() === "admin@gmail.com") {
        showAuthError("Admin account is pre-configured. Please log in instead.");
        return;
    }

    const userPool = getUserPool();
    const attributeList = [
        new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'email', Value: email })
    ];

    userPool.signUp(email, password, attributeList, null, function(err, result) {
        if (err) {
            console.error("Signup error:", err);
            showAuthError(err.message || JSON.stringify(err));
            return;
        }
        cognitoUser = result.user;
        showAuthSuccess("Signup successful! Please check your email for the verification code.");
        document.getElementById("verificationSection").style.display = "block";
    });
}

function handleVerification() {
    clearAuthMessages();
    const code = document.getElementById("authCode").value.trim();
    if (!code) {
        showAuthError("Please enter the verification code.");
        return;
    }

    if (!cognitoUser) {
        // If they refreshed the page, we need to recreate the cognitoUser object
        const email = document.getElementById("authEmail").value.trim();
        if (!email) {
            showAuthError("Please enter your email to verify.");
            return;
        }
        cognitoUser = new AmazonCognitoIdentity.CognitoUser({
            Username: email,
            Pool: getUserPool()
        });
    }

    cognitoUser.confirmRegistration(code, true, function(err, result) {
        if (err) {
            console.error("Verification error:", err);
            showAuthError(err.message || JSON.stringify(err));
            return;
        }
        showAuthSuccess("Verification successful! You can now log in.");
        document.getElementById("verificationSection").style.display = "none";
        document.getElementById("authCode").value = "";
    });
}

function handleCustomLogin() {
    clearAuthMessages();
    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value.trim();

    if (!email || !password) {
        showAuthError("Please enter both email and password.");
        return;
    }

    // Hardcoded Admin Bypass
    if (email.toLowerCase() === "admin@gmail.com" && password === "admin") {
        console.log("Hardcoded admin login successful. Opening Admin Dashboard.");
        
        // Mock a JWT for admin so UI logic knows we are logged in
        localStorage.setItem("cognito_id_token", "admin_mock_token");
        localStorage.setItem("cognito_access_token", "admin_mock_token");
        
        selectRole("admin");
        return;
    }

    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: email,
        Password: password,
    });

    const userData = {
        Username: email,
        Pool: getUserPool()
    };
    
    cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function(result) {
            const accessToken = result.getAccessToken().getJwtToken();
            const idToken = result.getIdToken().getJwtToken();

            localStorage.setItem("cognito_id_token", idToken);
            localStorage.setItem("cognito_access_token", accessToken);

            console.log("Logged in email:", email);
            if (email === "admin@gmail.com") {
                console.log("Opening Admin Dashboard");
                selectRole("admin");
            } else {
                const decoded = parseJwt(idToken);
                const customerId = (decoded && decoded.sub) ? decoded.sub : "customer_" + Date.now();
                localStorage.setItem("customerId", customerId);
                console.log("Opening Customer Dashboard");
                selectRole("customer");
            }
        },
        onFailure: function(err) {
            console.error("Login error:", err);
            if (err.code === 'UserNotConfirmedException') {
                showAuthError("Your account is not verified. Please check your email for the code.");
                document.getElementById("verificationSection").style.display = "block";
            } else {
                showAuthError(err.message || JSON.stringify(err));
            }
        }
    });
}

function logout() {
    localStorage.removeItem("customerId");
    localStorage.removeItem("cognito_id_token");
    localStorage.removeItem("cognito_access_token");
    
    const userPool = getUserPool();
    const cognitoUser = userPool.getCurrentUser();
    
    if (cognitoUser != null) {
        cognitoUser.signOut();
    }
    
    window.location.reload();
}

// Remove the Hosted UI callback handler since we don't need it anymore
function handleLoginCallback() {
    // Legacy function, no longer used
}