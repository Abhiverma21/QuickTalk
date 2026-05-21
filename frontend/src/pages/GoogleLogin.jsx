import React from "react";
import {useGoogleLogin} from '@react-oauth/google'

function GoogleLoginButton(){
    const responseGoogle = async (authResults) =>{
        try{
            if(authResults['code']){
                
            }
            
        }catch{
            console.error("Error in Google Login")
        }
    }

    const googleLogin = useGoogleLogin({
        onSuccess : responseGoogle,
        onError : responseGoogle,
        flow :'auth-code'
    })
    return (
        <button onClick={googleLogin}>Continue with Google</button>
    )
}

export default GoogleLoginButton;