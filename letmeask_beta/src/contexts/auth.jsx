import { createContext, useState, useEffect, useContext } from "react";
import { auth } from "../services/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export const AuthContext = createContext({});

export function AuthContextProvider(props) {

  // const { children } = props;

  const [user, setUser] = useState();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const { displayName, photoURL, uid } = user;

        if (!displayName || !photoURL) {
          throw new Error('Missing information from Google Account.');
        }

        setUser({
          id: uid,
          name: displayName,
          avatar: photoURL,
        })
      }
    });

    return () => {
      unsubscribe();
    }
  }, []);

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();

    await signInWithPopup(auth, provider).then((res) => {
      const credential = GoogleAuthProvider.credentialFromResult(res);
      const token = credential.accessToken;
      console.log(token);
      const loggedUser = res.user;
      console.log(loggedUser, 'loggedUser');

      if (loggedUser) {
        const { displayName, photoURL, uid } = loggedUser;

        setUser({
          id: uid,
          name: displayName,
          avatar: photoURL,
        });

        console.log('user', user);
      }


    });

    // if (result.user) {
    //   // const { displayName, photoURL, uid } = result.user;

    //   // if (!displayName || !photoURL) {
    //   //   throw new Error('Missing information from Google Account.')
    //   // }

    //   // setUser({
    //   //   id: uid,
    //   //   name: displayName,
    //   //   avatar: photoURL
    //   // })
    // }
  }

  async function signOut() {
    await auth.signOut();
  }

  const contextValue = {
    signInWithGoogle,
    user,
    signOut
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const value = useContext(AuthContext);
  return value;
};