import PostPage from '../post/page';

export default function Test() {
  const postId = '3sX60wjtDnMLVPsjkdi6'; // 例として固定のpostIdを使用

  return (
    <div>
      <h1>ポスト詳細</h1>
      <PostPage postId={postId} />
    </div>
  );
}