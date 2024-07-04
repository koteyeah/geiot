import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase/config';

/**
 * EmailとPasswordでサインイン
 * @param email
 * @param password
 * @returns Promise<boolean>
 */
export const signInWithEmail = async (args: {
  email: string;
  password: string;
}): Promise<boolean> => {
  let result: boolean = false;
  try {
    const user = await signInWithEmailAndPassword(auth, args.email, args.password);

    if (user) {
      result = true;
    }
  } catch (error) {
    result = false;
    console.log(error);
  }
  return result;
};

/**
 * EmailとPasswordでサインアップ
 * @param email
 * @param password
 * @returns Promise<boolean>
 */
export const signUpWithEmail = async (args: {
  email: string;
  password: string;
}): Promise<boolean> => {
  let result: boolean = false;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, args.email, args.password);
    const user = userCredential.user;

    if (user) {
      // Firestoreにユーザー情報を保存
      const colRef = doc(db, 'users', user.uid);
      await setDoc(colRef, {
        uid: user.uid,
        email: user.email,
        createdAt: new Date().toISOString(),
      });

      // メールアドレス確認のメールを送信
      await sendEmailVerification(user);

      result = true;
    }
  } catch (error) {
    // エラーオブジェクトを適切にキャスト
    if (error instanceof Error) {
      console.error('Error during sign up:', error);
      console.error('Error code:', error.name);
      console.error('Error message:', error.message);
    } else {
      console.error('Unknown error during sign up:', error);
    }
  }
  return result;
};