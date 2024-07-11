"use client";
import { useRouter } from "next/navigation";
import { Button, Flex, Heading, VStack } from "../../common/design";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/src/lib/firebase/config";
import { getDoc, doc, DocumentData } from "firebase/firestore";
//状態によって表示する出力各種
const LoadingComponent = () => (
  <Flex align="center" justify="center" height="100vh" flexDirection="column">
    <Heading>Loading...</Heading>
  </Flex>
);

const AinoriComponent = ({
  status,
  userType,
  otherUserData,
  ainoriData,
}: {
  status: string;
  userType: string;
  otherUserData: DocumentData | null;
  ainoriData: DocumentData | null;
}) => {
  return (
    <Flex align="center" justify="center" height="100vh">
      <VStack spacing={5}>
        <Heading>ここにプログレスバー。現在の状態は{status}</Heading>

        {otherUserData ? (
          <Heading>ここに取引相手のプロフィールを表示</Heading>
        ) : (
          <Heading>相乗りを募集中です。</Heading>
        )}
        {ainoriData && <Heading>ここに相乗り情報を表示。</Heading>}

        {status == "成立中" && userType == "ドライバー" && (
          <>
            <Heading>
              相乗りが成立しています。乗客と合流し、乗車処理を行なってください。
            </Heading>
            <Heading>ここに更新ボタン</Heading>
          </>
        )}
        {status == "成立中" && userType == "乗客" && (
          <>
            <Heading>
              相乗りが成立しています。ドライバーと合流したら、乗車処理を行なってください。
            </Heading>
            <Heading>
              乗車処理を行うボタンがここ。ここを押すと位置情報を取得してスタート地点の座標と合致していれば状態遷移
            </Heading>
          </>
        )}
        {status == "相乗り中" && userType == "ドライバー" && (
          <>
            <Heading>相乗り中です。安全に目的地まで相乗りを楽しんで！</Heading>
            <Heading>ここに更新ボタン</Heading>
          </>
        )}
        {status == "相乗り中" && userType == "乗客" && (
          <>
            <Heading>
              相乗り中です。シートベルトをしっかりしてめ相乗りを楽しんで！目的地に着いたら必ず以下のボタンを押して相乗りを完了してください。
            </Heading>
            <Heading>
              乗車完了を行うボタンがここ。ここを押すと位置情報を取得してゴール地点の座標と合致していれば状態遷移
            </Heading>
          </>
        )}
      </VStack>
    </Flex>
  );
};

export default function Page() {
  const [userData, setUser] = useState<DocumentData | null>(null);
  const [otherUserData, setOtherUser] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<
    "募集中" | "成立中" | "相乗り中" | "相乗り終了" | null
  >(null);
  const [ainoriData, setAinoriData] = useState<DocumentData | null>(null);
  const [userType, setUserType] = useState<"ドライバー" | "乗客" | null>(null);

  useEffect(() => {
    // ユーザーのログイン状態を確認したのち、相乗り状況を取得し、格納
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser(userData);
            const isAinori = userData!.isAinori;
            if (isAinori) {
              const ainoriDoc = await getDoc(doc(db, "ainories", isAinori));
              if (ainoriDoc.exists()) {
                const ainoriData = ainoriDoc.data();
                setAinoriData(ainoriData);
                setStatus(ainoriData.status);
                setUserType(
                  ainoriData.driver === user.uid ? "ドライバー" : "乗客"
                );
              }
              if (status == "成立中" || status == "相乗り中") {
                switch (userType) {
                  case "ドライバー":
                    const passengerDoc = await getDoc(
                      doc(db, "users", ainoriData!.passenger)
                    );
                    if (passengerDoc.exists())
                      setOtherUser(passengerDoc.data());
                    break;
                  case "乗客":
                    const driverDoc = await getDoc(
                      doc(db, "users", ainoriData!.driver)
                    );
                    if (driverDoc.exists()) setOtherUser(driverDoc.data());
                    break;
                }
              }
            }
            setLoading(false);
          }
        } catch (error) {
          console.log(error);
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <AinoriComponent
      status={"成立中"}
      userType={"ドライバー"}
      otherUserData={null}
      ainoriData={null}
    />
  );
}
