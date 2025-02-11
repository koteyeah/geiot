"use client";
import { useRouter } from "next/navigation";
import {
  Text,
  Button,
  Flex,
  Heading,
  VStack,
  useDisclosure,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "../../common/design";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/src/lib/firebase/config";

import {
  getDoc,
  doc,
  DocumentData,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getPositionDifference } from "./utils";
import StepperComponent from "./StepperComponent";
import ProfileCard from "./ProfileCard";

export default function Page() {
  const [userData, setUser] = useState<DocumentData | null>(null);
  const [userKey, setUserKey] = useState<string>("");
  const [otherUserData, setOtherUser] = useState<DocumentData | null>(null);
  const [otherUserInfo, setOtherUserInfo] = useState<DocumentData | null>(null);
  const [otherUserDriverInfo, setOtherUserDriverInfo] =
    useState<DocumentData | null>(null);
  const [otherUserKey, setOtherUserKey] = useState<string>("");
  const [ainoriData, setAinori] = useState<DocumentData | null>(null);
  const [ainoriKey, setAinoriKey] = useState<string>("");
  const [status, setStatus] = useState<
    "募集中" | "成立" | "相乗り中" | "到着" | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userType, setUserType] = useState<"ドライバー" | "乗客" | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const router = useRouter();
  let isProcessing = false;

  const handleRideButton = async () => {
    if (isProcessing) return;
    isProcessing = true;
    const departureLat = 34.731922;
    const departureLon = 135.73168;
    try {
      const isNear = await getPositionDifference(departureLat, departureLon);
      if (isNear) {
        console.log("出発地から500m以内です。相乗りを開始します。");
        alert("出発地から500m以内です。相乗りを開始します。");
        setStatus("相乗り中");
        await updateDoc(doc(db, "ainories", ainoriKey), {
          status: "相乗り中",
        });
      } else {
        console.log("出発地から離れています。");
        alert("出発地から離れています。");
      }
    } catch (error) {
      console.log("位置情報の取得に失敗しました。");
      alert("位置情報の取得に失敗しました。");
    } finally {
      isProcessing = false;
    }
  };

  const handleGetOffButton = async () => {
    if (isProcessing) return; // 処理中であれば何もしない
    isProcessing = true; // フラグを立てる
    let destinationLat = 34.731922;
    let destinationLon = 135.73168;
    // switch (ainoriData!.goal_spot) {
    //   case "学研北生駒駅":
    //     destinationLat = 34.7249652;
    //     destinationLon = 135.7233898;
    //     break;
    //   case "学研奈良登美ヶ丘駅":
    //     destinationLat = 34.7265719;
    //     destinationLon = 135.752466;
    //     break;
    //   case "UR中登美第三団地":
    //     destinationLat = 34.7167044;
    //     destinationLon = 135.7444945;
    //     break;
    // }
    console.log(destinationLat, destinationLon);
    try {
      const isNear = await getPositionDifference(
        destinationLat,
        destinationLon
      );
      if (isNear) {
        console.log("目的地から500m以内です。相乗りを完了します。");
        alert("目的地から500m以内です。相乗りを完了します。");
        setStatus("到着");
        await updateDoc(doc(db, "ainories", ainoriKey), {
          status: "到着",
        });
        await updateDoc(doc(db, "Users", userKey), {
          status: null,
        });
        await updateDoc(doc(db, "Users", otherUserKey), {
          status: null,
        });
        router.push("/evaluation");
      } else {
        console.log("出発地から離れています。");
        alert("出発地から離れています。");
      }
    } catch (error) {
      console.error("位置情報の取得に失敗しました。");
      alert("位置情報の取得に失敗しました。");
    } finally {
      isProcessing = false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          console.log("ユーザーが見つかりました" + user.uid);
          setUserKey(user.uid);
          const userDoc = await getDoc(doc(db, "Users", user.uid));
          if (userDoc.exists()) {
            console.log("ユーザーテーブルを発見しました。");
            const userData = userDoc.data();
            setUser(userData);
            const isAinori = userData!.status;
            if (isAinori) {
              console.log("相乗り処理が存在します。" + isAinori);
              const ainoriDoc = await getDoc(doc(db, "ainories", isAinori));
              if (ainoriDoc.exists()) {
                const ainoriData = ainoriDoc.data();
                setAinoriKey(ainoriDoc.id);
                setAinori(ainoriData);
                setStatus(ainoriData.status);
                setUserType(
                  ainoriData.driver === user.uid ? "ドライバー" : "乗客"
                );
                console.log(ainoriData);
                if (
                  ainoriData.status === "成立" ||
                  ainoriData.status === "相乗り中"
                ) {
                  switch (
                    ainoriData.driver === user.uid ? "ドライバー" : "乗客"
                  ) {
                    case "ドライバー":
                      const passengerDoc = await getDoc(
                        doc(db, "Users", ainoriData.passenger)
                      );
                      const passengerInfoDoc = await getDoc(
                        doc(
                          db,
                          "Users",
                          ainoriData.passenger,
                          "Profile",
                          "Info"
                        )
                      );
                      if (passengerDoc.exists()) {
                        setOtherUserKey(passengerDoc.id);
                      }
                      if (passengerInfoDoc.exists()) {
                        setOtherUserInfo(passengerInfoDoc.data());
                      }
                      break;
                    case "乗客":
                      const otherDoc = await getDoc(
                        doc(db, "Users", ainoriData.driver)
                      );
                      const otherInfoDoc = await getDoc(
                        doc(db, "Users", ainoriData.driver, "Profile", "Info")
                      );
                      const otherDriverInfoDoc = await getDoc(
                        doc(
                          db,
                          "Users",
                          ainoriData.driver,
                          "Profile",
                          "DriverInfo"
                        )
                      );
                      if (otherDoc.exists()) {
                        setOtherUserKey(otherDoc.id);
                      }
                      if (otherInfoDoc.exists()) {
                        setOtherUserInfo(otherInfoDoc.data());
                      }
                      if (otherDriverInfoDoc.exists()) {
                        setOtherUserDriverInfo(otherDriverInfoDoc.data());
                      }
                      break;
                  }
                  console.log("取引相手のIDは" + otherUserKey);
                }
              }
            }
          }
        } catch (error) {
          console.log(error);
        }
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);
  if (isLoading) return <Heading>loading...</Heading>;
  // 相乗りを行っていない場合の出力
  if (status == null) {
    return (
      <Heading>
        相乗り処理は行われていません！<br></br>
        掲示板から相乗りを利用してみよう。
      </Heading>
    );
  }
  if (status == "募集中") {
    return (
      <>
        <Text>現在相乗りを募集しています。</Text>
        <Text>ここに相乗り情報を表示。</Text>
        <>
          <Button onClick={onOpen}>取引をキャンセル</Button>

          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>本当にキャンセルしますか？</ModalHeader>
              <ModalCloseButton />
              <ModalBody>ここに胸を打つメッセージを表示する</ModalBody>

              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={onClose}>
                  Close
                </Button>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await deleteDoc(doc(db, "ainories", ainoriKey));
                    await updateDoc(doc(db, "Users", userKey), {
                      status: null,
                    });
                    if (otherUserKey != "") {
                      await updateDoc(doc(db, "Users", otherUserKey), {
                        status: null,
                      });
                    }
                    alert("取引をキャンセルしました。");
                    router.push("/postList");
                  }}
                >
                  キャンセルする
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      </>
    );
  }

  return (
    <Flex align="center" justify="center" height="100vh">
      <VStack spacing={5}>
        {status && <StepperComponent status={status} />}
        {(status === "成立" || status === "相乗り中") && (
          <>
            {otherUserInfo && ainoriData && (
              <ProfileCard
                ainoriData={ainoriData}
                ainoriKey={ainoriKey}
                otherUserInfo={otherUserInfo}
                otherUserDriverInfo={otherUserDriverInfo || undefined}
              />
            )}
          </>
        )}
        {status == "成立" && (
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
                <Button colorScheme="teal" onClick={handleRideButton}>乗車する</Button>
              </>
            )}
          </>
        )}
        {status == "相乗り中" && (
          <>
            <Heading>相乗り中です。目的地まで安全に相乗りを楽しんで！</Heading>
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
                <Button colorScheme="teal" onClick={handleGetOffButton}>降車する</Button>
              </>
            )}
          </>
        )}
        {status == "到着" && userType == "乗客" && (
          <>
            <Heading>到着しました！またのご利用お待ちしています！</Heading>
            <Text fontSize="3xl">別のページに移動してください</Text>
          </>
        )}
        {status == "成立" && (
          <>
            <Button onClick={onOpen}>取引をキャンセル</Button>

            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>本当にキャンセルしますか？</ModalHeader>
                <ModalCloseButton />
                <ModalBody>ここに胸を打つメッセージを表示する</ModalBody>

                <ModalFooter>
                  <Button colorScheme="blue" mr={3} onClick={onClose}>
                    Close
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      await deleteDoc(doc(db, "ainories", ainoriKey));
                      await updateDoc(doc(db, "Users", userKey), {
                        status: null,
                      });
                      if (otherUserKey != "") {
                        await updateDoc(doc(db, "Users", otherUserKey), {
                          status: null,
                        });
                      }
                      alert("取引をキャンセルしました。");
                      router.push("/postList");
                    }}
                  >
                    キャンセルする
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </>
        )}
      </VStack>
    </Flex>
  );
}
