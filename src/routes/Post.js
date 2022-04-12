import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";
import Banner2 from "../components/banner/Banner2";
import BoardBanner from "../components/board/BoardBanner";
import Detail from "../components/post/Detail";
import Result from "../components/post/Result";
import Comments from "../components/post/Comments";
import style from "./Post.module.css";

// data: id, title, content, registerDate, finishDate,
//       author, tags, choice, isFinished, isVoted
function Post() {
  // useParams: url에 있는 값 반환
  const { id } = useParams();
  const history = useHistory();

  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [loadingResult, setLoadingResult] = useState(true);

  const [postData, setPostData] = useState({}); // post
  const [options, setOptions] = useState({}); // options
  const [comments, setComments] = useState([]);
  const [visible, setVisible] = useState(false); // 댓글 visible
  const [likedComments, setLikedComments] = useState([]); // 유저가 좋아요한 댓글들
  const [result, setResult] = useState([]); // 결과

  const [newComment, setNewComment] = useState("");

  // 글
  const getPost = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/posts/${id}`);
      // const response = await axios.get(`http://localhost:3000/post`);
      setPostData(response.data);
      setLoadingPost(false);
      // console.log("post res.d", response.data);
    } catch (error) {
      console.log("에러post:: ", error);
    }
  };
  // 내 선택지
  const getOptions = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/posts/${id}/options`,
        { withCredentials: true }
      );
      // const response = await axios.get(`http://localhost:3000/options`);
      setOptions(response.data);
      setLoadingOptions(false);
    } catch (error) {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/auth/refresh",
          {
            withCredentials: true,
          }
        );
        localStorage.setItem(
          "access_token",
          response.data.data["access_token"]
        );
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.data["access_token"]}`;
        window.location.reload();
      } catch (error) {
        alert("로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.");
        history.push("/login");
      }
    }
  };
  // 댓글
  const getComments = async () => {
    try {
      // 찐
      const response = await axios.get(
        `http://localhost:3000/api/posts/${id}/comments`,
        { withCredentials: true }
      );
      // const response = await axios.get(`http://localhost:3000/ccomments`);
      setComments(response.data.comments);
      setVisible(response.data.isVisible);
      setLikedComments(response.data.mylikes);
      setLoadingComments(false);
    } catch (error) {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/auth/refresh",
          {
            withCredentials: true,
          }
        );
        localStorage.setItem(
          "access_token",
          response.data.data["access_token"]
        );
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.data["access_token"]}`;
        window.location.reload();
      } catch (error) {
        alert("로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.");
        history.push("/login");
      }
    }
  };
  // 결과
  const getResult = async () => {
    try {
      // 찐
      const response = await axios.get(
        `http://localhost:3000/api/posts/${id}/options/results`
      );
      // const response = await axios.get(`http://localhost:3000/result`);
      setResult(response.data);
      setLoadingResult(false);
    } catch (error) {
      console.log(error);
    }
  };

  // 처음. 글, 내선택지, 결과, 댓글 불러옴
  useEffect(() => {
    getPost();
    getOptions();
    getResult();
    getComments();
  }, []);

  // 내가 좋아요한 댓글인지
  const compare = (id) => {
    return likedComments.includes(id);
  };

  // 새 댓글 작성
  const onChange = (event) => {
    setNewComment(event.target.value);
  };
  const submitHandler = async () => {
    try {
      await axios.post(
        `http://localhost:3000/posts/${id}/comments`,
        { content: newComment },
        { withCredentials: true }
      );
    } catch (error) {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/auth/refresh",
          {
            withCredentials: true,
          }
        );
        localStorage.setItem(
          "access_token",
          response.data.data["access_token"]
        );
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.data["access_token"]}`;
        window.location.reload();
      } catch (error) {
        alert("로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.");
        history.push("/login");
      }
    }
  };

  return (
    <div>
      <Banner2 width={270} height={"100vh"} />
      <BoardBanner board_name={false} newPost={false} />

      {/* 게시글 상세 조회 */}
      {loadingPost || loadingOptions ? null : (
        <Detail
          id={postData.id}
          title={postData.title}
          profilePic={postData.profile}
          content={postData.content}
          registerDate={postData.registerDate}
          finishDate={postData.finishDate}
          author={postData.author}
          isFinished={postData.isFinished}
          tags={postData.tags} // 배열
          isVoted={options.isVoted}
          choices={options.choices} // 배열
          myVote={options.myVote} // 숫자
        />
      )}

      {/* 결과 */}
      {loadingResult ? null : postData.isFinished ? (
        <div className={style.container}>
          <Result result={result} />
        </div>
      ) : null}

      {/* 댓글 */}
      {visible === false ? null : loadingComments ? null : (
        <div className={style.container}>
          <form onSubmit={submitHandler} className={style.commentForm}>
            <textarea
              className={style.textarea}
              placeholder="댓글을 작성해보세요."
              rows="3"
              onChange={onChange}
            ></textarea>
            <button className={style.submitBtn} type="submit">
              등록
            </button>
          </form>

          <ul className={style.comments}>
            {comments.map((comment) =>
              compare(comment.id) ? (
                <Comments
                  postId={id}
                  key={comment.id}
                  id={comment.id}
                  choiceNum={comment.choiceId}
                  status={comment.status}
                  nickname={comment.author}
                  profilePic={comment.profilePic}
                  date={comment.registerDate}
                  likedNum={comment.likes}
                  comment={comment.content}
                  mylike={true}
                />
              ) : (
                <Comments
                  postId={id}
                  key={comment.id}
                  id={comment.id}
                  choiceNum={comment.choiceId}
                  status={comment.status}
                  nickname={comment.author}
                  profilePic={comment.profilePic}
                  date={comment.registerDate}
                  likedNum={comment.likes}
                  comment={comment.content}
                  mylike={false}
                />
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Post;
