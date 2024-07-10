import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase/config';

/**
 * EmailとPasswordでサインイン
 * @param email
 * @param password
 * @returns Promise<'home' | 'profile'>
 */
export const signInWithEmail = async (args: {
  email: string
  password: string
}): Promise<'home' | 'profile'> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, args.email, args.password);
    const user = userCredential.user;

    // Firestoreからプロフィールデータを取得
    const profileDoc = await getDoc(doc(db, 'Users', user.uid, 'Profile', 'Info'));

    if (profileDoc.exists()) {
      return 'home';
    } else {
      return 'profile';
    }
  } catch (error) {
    console.error('Error signing in: ', error);
    throw new Error('サインインに失敗しました。');
  }
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