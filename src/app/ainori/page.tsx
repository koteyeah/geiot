"use client";
import { useRouter } from "next/navigation";
import { Text, Button, Flex, Heading, VStack } from "../../common/design";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/src/lib/firebase/config";
import { getDoc, doc, DocumentData } from "firebase/firestore";
import { getPositionDifference } from "./utils";

export default function Page() {
  const [userData, setUser] = useState<DocumentData | null>(null);
  const [otherUserData, setOtherUser] = useState<DocumentData | null>(null);
  const [status, setStatus] = useState<
    "募集中" | "成立中" | "相乗り中" | "相乗り終了" | null
  >(null);
  const [ainoriData, setAinoriData] = useState<DocumentData | null>(null);
  const [userType, setUserType] = useState<"ドライバー" | "乗客" | null>(null);
  const router = useRouter();
  let isProcessing = false; // ボタン等の操作フラグを追加

  const handleRideButton = async () => {
    if (isProcessing) return; // 処理中であれば何もしない
    isProcessing = true; // フラグを立てる
    // NAISTの位置
    const departureLat = 34.731922;
    const departureLon = 135.73168;
    try {
      const isNear = await getPositionDifference(departureLat, departureLon);
      if (isNear) {
        console.log("出発地から500m以内です。相乗りを開始します。");
        alert("出発地から500m以内です。相乗りを開始します。");
        setStatus("相乗り中");
        // データベースの処理を書く
      } else {
        console.log("出発地から離れています。");
        alert("出発地から離れています。");
        // 離れている場合の処理を追加
      }
    } catch (error) {
      console.log("位置情報の取得に失敗しました。");
      alert("位置情報の取得に失敗しました。");
    } finally {
      isProcessing = false; // 処理完了後にフラグを解除
    }
  };

  const handleGetOffButton = async () => {
    if (isProcessing) return; // 処理中であれば何もしない
    isProcessing = true; // フラグを立てる
    const destinationLat = 34.7249499;
    const destinationLon = 135.7218884;
    try {
      const isNear = await getPositionDifference(
        destinationLat,
        destinationLon
      );
      if (isNear) {
        console.log("目的地から500m以内です。相乗りを完了します。");
        alert("目的地から500m以内です。相乗りを完了します。");
        setStatus("相乗り終了");
        // データベースの処理を記述
      } else {
        console.log("出発地から離れています。");
        alert("出発地から離れています。");
        // 離れている場合の処理を追加
      }
    } catch (error) {
      console.error("位置情報の取得に失敗しました。");
      alert("位置情報の取得に失敗しました。");
    } finally {
      isProcessing = false; // 処理完了後にフラグを解除
    }
  };
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
          }
        } catch (error) {
          console.log(error);
        }
      }
    });
    return () => unsubscribe();
  }, []);
  const AinoriComponent = ({
    status,
    userType,
    otherUserData,
    ainoriData,
  }: {
    status: string | null;
    userType: string | null;
    otherUserData: DocumentData | null;
    ainoriData: DocumentData | null;
  }) => {
    if (status == null)
      return (
        <Heading>
          相乗り処理は行われていません！<br></br>
          掲示板から相乗りを利用してみよう。
        </Heading>
      );
    return (
      <Flex align="center" justify="center" height="100vh">
        <VStack spacing={5}>
          {status && (
            <Heading>ここにプログレスバー。現在の状態は{status}</Heading>
          )}
          {(status == "成立中" || status == "相乗り中") && (
            <Text>ここに取引相手のプロフィールを表示</Text>
          )}
          {status == "募集中" && <Text>現在相乗りを募集しています。</Text>}
          {ainoriData && <Text>ここに相乗り情報を表示。</Text>}
          {status == "成立中" && (
            <>
              <Heading>
                相乗りが成立しています。出発時刻に遅れないようにしましょう。
              </Heading>
              {userType === "ドライバー" ? (
                <Button
                  onClick={() => {
                    router.refresh();
                  }}
                >
                  更新
                </Button>
              ) : (
                <>
                  <Text>ドライバーと合流したら乗車するを押してください。</Text>
                  <Button onClick={handleRideButton}>乗車する</Button>
                </>
              )}
            </>
          )}
          {status == "相乗り中" && (
            <>
              <Heading>
                相乗り中です。目的地まで安全に相乗りを楽しんで！
              </Heading>
              {userType === "ドライバー" ? (
                <Button
                  onClick={() => {
                    console.log("aaa");
                    router.refresh();
                  }}
                >
                  更新
                </Button>
              ) : (
                <>
                  <Text>目的地に到着したら降車するを押してください</Text>
                  <Button onClick={handleGetOffButton}>降車する</Button>
                </>
              )}
            </>
          )}
          {status == "相乗り終了" && userType == "乗客" && (
            <>
              <Heading>
                相乗りは完了しました！またのご利用お待ちしています！
              </Heading>
              <Text fontSize="3xl">別のページに移動してください</Text>
            </>
          )}
        </VStack>
      </Flex>
    );
  };

  return (
    <AinoriComponent
      status={status}
      userType={userType}
      otherUserData={null}
      ainoriData={null}
    />
  );
}
