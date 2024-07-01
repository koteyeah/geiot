import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
  } from 'firebase/auth'
  import { getFirestore, doc, setDoc } from 'firebase/firestore';
  import { auth, db } from '../../../lib/firebase/config'
  
  /**
   * EmailとPasswordでサインイン
   * @param email
   * @param password
   * @returns Promise<boolean>
   */
  export const signInWithEmail = async (args: {
    email: string
    password: string
  }): Promise<boolean> => {
    let result: boolean = false
    try {
      const user = await signInWithEmailAndPassword(
        auth,
        args.email,
        args.password
      )
  
      if (user) {
        result = true
      }
    } catch (error) {
      result = false
      console.log(error)
    }
    return result
  }
  
  /**
   * EmailとPasswordでサインアップ
   * @param username
   * @param email
   * @param password
   * @returns Promise<boolean>
   */
  export const signUpWithEmail = async (args: {
    email: string
    password: string
  }): Promise<boolean> => {
    let result: boolean = false
    try {
      const user = await createUserWithEmailAndPassword(
        auth,
        args.email,
        args.password
      ).then(async (userCredential) => {
        /** thenから追加します */
        /** cloud firestoreのコレクション */
        const colRef = doc(db, 'users', userCredential.user.uid)
        /** document追加 */
        await setDoc(colRef, {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
        })
        return userCredential.user
      })
      if (user) {
        result = true
      }
    } catch (error) {
      result = false
      console.log(error)
    }
    return result
  }
  
  /**
   * ログアウト処理
   * @returns Promise<boolean>
   */
  export const logout = async (): Promise<boolean> => {
    let result: boolean = false
  
    await signOut(auth)
      .then(() => {
        result = true
      })
      .catch((error) => {
        console.log(error)
        result = false
      })
  
    return result
  }