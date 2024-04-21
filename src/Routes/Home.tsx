import { useQuery } from "react-query";
import { IGetMovieDetail, IGetMovieResult, getDetail, getLatestMovies, getTopRatedMovies, getUpcomingMovies } from "../api";
import { motion, AnimatePresence, useViewportScroll } from "framer-motion";
import styled from "styled-components";
import {makeImagePath} from "./utils";
import { useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import DetailedInfo from "../Components/DetailedInfo";

const Wrapper = styled.div`
  background: black;
  padding-bottom: 200px;
  overflow-x: hidden; //x축 스크롤바 안 생기게
`;


const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Banner = styled.div<{bgPhoto:string}>`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  //백그라운드 이미지에 속성 두 개 주기. 하나는 이미지를 넣고,
  //하나는 검은색 반투명 그라데이션을 줘서
  //이미지 위에 폰트가 올라갔을 때 폰트가 눈에 띄게 만들어주고
  //좀더 쎄련^^스럽게 보이도록~
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)), 
                    url(${(props) => props.bgPhoto});
  background-size: cover;
`;

const Title = styled.h2`
  font-size: 48px;
  margin-bottom: 20px;
`;

const Overview = styled.p`
  font-size: 16px;
  width: 50%;
`;

const SliderDiv = styled.div`
    position: relative;
    margin-bottom: 220px;
`;

const Slider = styled.div`
  position: relative;
`;

const SliderTitle = styled.h3`
    font-size: 25px;
    padding: 10px;
`;

const SliderBtn = styled.button`
    cursor: pointer;
    font-size: 17px;
    font-weight: 500;
    width: 70px;
    position: absolute;
    right: 1%;
    top: -40px;
    border-color: transparent;
    color: white;
    border-radius: 15px;
    background-color: rgba( 0, 0, 0, 0.5 );
    box-shadow: white 0px 0px 7px 0px, white 0px 0px 1px 0px;
    &:hover{
        background-color: #2a2a2a;
    }
`;

const Row = styled(motion.div)`
//슬라이더 한 줄 한 줄을 의미. 각 줄마다 애니메이션 들어갈 거니까 motion
  display: grid;
  gap: 5px; //한 줄에 들어갈 내용물마다 gap 두 개
  grid-template-columns: repeat(6, 1fr); //한 줄에 내용물 6개씩 들어감
  position: absolute;
  width: 100%;
`;

const Box = styled(motion.div)<{ bgPhoto: string }>`
//슬라이더 한 줄에 들어갈 box (영화나 tv쇼 각 한 개씩들)
//걔한테도 애니메이션 들어갈 거니까 motion
//Box안에 이제 이미지가 들어가야 해서 bgPhoto라는 애가 들어올 거라고 알려줌
  background-color: white;
  background-image: url(${(props) => props.bgPhoto});
  background-size: cover;
  background-position: center center;
  height: 200px;
  font-size: 66px;
  cursor: pointer;

  //근데 박스가 커질 때 슬라이더의 첫번째랑 마지막 박스도 똑같이 커지면
  //양옆이 잘릴 거 아님?
  //그런 일이 없도록 첫번째랑 마지막 박스는 정해진 부분에서만 커지도록
  //여기서 제한을 줌
  &:first-child { 
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;

const Info = styled(motion.div)`
//박스 hover했을 때 나올 정보 스타일링!
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 18px;
  }
`;

const Overlay = styled(motion.div)`
//Overlay 만들어주기
//카드가 나올 때 오버레이(카드 보다 더 큰 영역으로) 위에 카드가 위치하게 됨
  position: fixed; //그 overlay의 절단된 선 보이지 않도록 position 설정
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;

const BigMovie = styled(motion.div)`
  position: absolute;
  width: 40vw;
  height: 80vh;
  left: 0;
  right: 0;
  margin: 0 auto;
  border-radius: 15px;
  overflow: hidden;
  background-color: ${(props) => props.theme.black.lighter};
`;

const BigCover = styled.div`
  width: 100%;
  background-size: cover;
  background-position: center center;
  height: 300px;
`;

const BigTitle = styled.h3`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  font-size: 30px;
  position: relative;
  top: -100px;
`;

const BigOverview = styled.p`
  padding-left: 25px;
  position: relative;
  font-size: 19px;
  top: -70px;
  width: 95%;
  color: ${(props) => props.theme.white.lighter};
`;

const rowVariants = {
  //각 슬라이더 줄에 적용해줄 애니메이션
  hidden: {
    //사용자의 윈도우 사이즈를 받아와서 값을 수정해주기
    //화면의 오른쪽에서 왼쪽으로 슬라이딩 되도록 해주려고 함
    //새로운 슬라이더끼리 너무 붙어있지 않도록 +5 -5의 갭을 설정해줌
    x: window.outerWidth + 5,
  },
  visible: {
    x: 0,
  },
  exit: {
    x: -window.outerWidth - 5,
  },
};

const boxVariants = {
  //각 박스에 정밀한 애니메이션을 주기 위해
  normal: {
    scale: 1,
  },
  hover: {
    //박스에 마우스 올리면 나타낼 애니메이션
    scale: 1.3,
    y: -80, //커지면서 살짝 위로 올라가도록
    transition: {
      //마우스가 나갈 때가 아니라 올라왔을 때만 딜레이를 주려고 
      //hover를 만들어서 transition 준 거임
      delay: 0.5,
      duaration: 0.1,
      type: "tween", //통통 튀도록 보이지 않게 tween 타입으로 바꿔주기
    },
  },
};

const infoVariants = {
  //hover되면 나오는 info에도 애니메이션 적용해주기
  hover: {
    opacity: 1,
    transition: {
      delay: 0.5,
      duaration: 0.1,
      type: "tween",
    },
  },
};




//한 슬라이더에 들어갈 박스의 개수를 상수로 고정해줌
const offset = 6;



function Home() {
  //api에 써놨던 getMovies 함수를 호출하고 
  //호출이 잘 되면 data에 구조체 배열을 받아온다.
  //isLoading으로 로딩중인지 여부도 알 수 있음!

  //그리고 api에서 구현한대로 쿼리의 결과 인터페이스형을 알려준다.
  const { data : nowData, isLoading : nowLoading  } = useQuery<IGetMovieResult>(["movies", "nowPlaying"], getLatestMovies);
  const { data : topData, isLoading : topLoading  } = useQuery<IGetMovieResult>(["movies", "topRate"], getTopRatedMovies);
  const { data : upcomingData, isLoading : upcomingLoading  } = useQuery<IGetMovieResult>(["movies", "upcoming"], getUpcomingMovies);


  
  const [sliderStates, setSliderStates] = useState<{ [key: string]: { index: number, leaving: boolean } }>({
    nowPlaying: { index: 0, leaving: false },
    topRate: { index: 0, leaving: false },
    upcoming: {index:0, leaving: false},
  });

  const increaseIndex = (slider: string, data: IGetMovieResult) => {
    const { index, leaving } = sliderStates[slider];
    if (data && !leaving) {
      setSliderStates(prevStates => ({
        ...prevStates,
        [slider]: {
          ...prevStates[slider],
          leaving: true,
        }
      }));
      const totalMovies = data.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setSliderStates(prevStates => ({
        ...prevStates,
        [slider]: {
          ...prevStates[slider],
          index: index === maxIndex ? 0 : index + 1,
        }
      }));
    }
  };

  // 해당 슬라이더의 leaving 상태를 토글하는 함수
  const toggleLeaving = (slider: string) => {
    setSliderStates(prevStates => ({
      ...prevStates,
      [slider]: {
        ...prevStates[slider],
        leaving: !prevStates[slider].leaving,
      }
    }));
  };

  //주소를 바꿔주기 위한 useHistory!
  //useHistory를 사용하면 url를 왔다갔다할 수 있다.
  //여러 route 사이를 지나다닐 수 있다는 뜻.
  const history = useHistory();

  //지금 내 경로가 저기 써놓은 저 경로가 맞는지 확인하는 것.
  //movidId는 string형이라는 것 알려줘서 ts 오류 없애기
  const bigMovieMatch = useRouteMatch<{ slider: string, movieId: string }>("/movies/:slider/:movieId");

  //내가 어떤 박스를 클릭했을 때, 그 박스가 가진 movieId를 가져오려고 함.
  const onBoxClicked = (slider: string, movieId: number) => {
    //history에다가 이 경로를 넣어주기
    //useHistory가 이 경로를 이용해서 갈 수 있도록 넣어주는 거임
    history.push(`/movies/${slider}/${movieId}`);
  };

 //카드가 튀어나올 때 유저가 스크롤을 아무리 많이 내렸더라도 화면 기준 정중앙에 카드가 나오도록
 //현재 유저의 스크롤 상태를 감지해준다.
  const { scrollY } = useViewportScroll();

  //오버레이(카드 나왔을 때 카드 밑바닥에 위치하는 레이어)를 클릭하면 카드가 없어지도록
  //url을 홈으로 바꿔준느 거임
  const onOverlayClick = () => history.push("/");


  //선택된 Movie 상수 만들어주기. 
  //일단 지금 경로에 잘 들어왔는지 확인부터 하고,
  //조건문을 주는데, 많은 movie들 중에 지금 우리가 들어와 있는 이 id랑 같은 애만 넘겨달라고 하기.
  //number랑 string이랑 안 맞으니까 +로 해서 둘다 number로 만들어주기
  const clickedMovie = 
  bigMovieMatch?.params.movieId && 
  (nowData?.results.find((movie) => movie.id === +bigMovieMatch.params.movieId!) || 
  topData?.results.find((movie) => movie.id === +bigMovieMatch.params.movieId!) || 
  upcomingData?.results.find((movie) => movie.id === +bigMovieMatch.params.movieId!));


  return (
    <Wrapper
    //Loading중이라면 Loader 보여주기
    >
      {nowLoading ? <Loader>Loading...</Loader>
      : 
      <>
        {/* 쿼리에서 얻은 영화 배열의 첫번째 항목 
        제일 큰 배너로 먼저 감싸고 그 다음 타이틀, 개요 순으로 배치
        */}
        <Banner 
          bgPhoto = {makeImagePath(nowData?.results[0].backdrop_path || "")}> 
          <Title>{nowData?.results[0].title}</Title>
          <Overview>{nowData?.results[0].overview}</Overview>
        </Banner>

        <SliderDiv>
        <SliderTitle>Now Playing</SliderTitle> 
        <Slider>        
        <SliderBtn onClick={() => nowData && increaseIndex("nowPlaying", nowData)}>Next</SliderBtn>
        <AnimatePresence 
        //맨 처음 슬라이더들이 만들어질 때는 미끄러져 들어오지 않게 하고
        //처음 창 떴을 때 말고 클릭해서 슬라이더들이 움직일 때만 미끄러질 수 있게
        //이니셜을 false로 두는 것(처음 랜더링 될 때는 애니메이션 적용 안 되게)
          initial={false} 
          //이거는 슬라이더 줄들이 바뀔 때 너무 큰 간격이 생기지 않게 해주는 거
          //슬라이더들이 바뀔 때마다 새로 랜더링하지 않도록 상태값을 봐주는 거임
          //위에 increseIndex랑 같이 상호작용함
          onExitComplete={() => toggleLeaving("nowPlaying")}>

              <Row 
              //한 줄에 6개 박스씩 보이는데, 그 한 줄이 무한하게 계속 생겨남
              //Row를 꼭 여러개 만들지 않아도, key만 늘어나게 해주면 알아서 그렇게 생김
              //key 바꿔주는 함수를 어디 눌렀을 때 적용시킬지만 정해서 넣어주면 됨
              //지금은 배너 클릭할 때 함수 적용해주고 있음
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={sliderStates.nowPlaying.index}
              >
                
                { //api에 의해서 영화는 총 19개가 넘어옴
                 //그 중 1개는 큰 배너로 사용하고 있고
                 //나머지 18개가 슬라이더 3개에 나눠져서 들어가는 거임
                  nowData?.results 
                  .slice(1) //맨 처음 1개는 배너로 이미 사용됐으니까 잘라내고 시작하는 거
                  .slice(offset * sliderStates.nowPlaying.index, offset * sliderStates.nowPlaying.index + offset) //페이징하는 부분. 
                  //인덱스는 위에 토탈 개수 상한해놓은 부분때문에 0~2까지만 움직일 거임
                  .map((movie) => (
                    <Box
                    //각 박스에 movie의 이미지 넣어주기
                    //layoutId를 넣어서 Box와 Box를 눌렀을 때 나타날 카드랑 이어주기
                    layoutId={movie.id + "nowPlaying"}
                    key={movie.id}
                    whileHover="hover" //hover 애니메이션 넣어주기
                    initial="normal"
                    variants={boxVariants}
                    //통통 튀도록 보이지 않게 tween 타입으로 바꿔주기 
                    //(hover뿐 아니라 전체적으로도 다 적용되게 여기에도 써줌)
                    transition={{ type: "tween" }} 
                    //박스 클릭했을 때 그 박스가 가진 movie의 Id를 알 수 있도록 onClick함수 적용
                    onClick={() => onBoxClicked("nowPlaying", movie.id)}
                    bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                    >
                      <Info 
                      //Box라는 부모 밑에 있기 때문에 hover 속성은 저절로 상속된다.
                        variants={infoVariants}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
          </Slider>
          </SliderDiv>

        <SliderDiv>
        <SliderTitle>Top Rated</SliderTitle> 
        <Slider>        
        <SliderBtn onClick={() => topData && increaseIndex("topRate", topData)}>Next</SliderBtn>
        <AnimatePresence 
          initial={false} 
          onExitComplete={() => toggleLeaving("topRate")}>
              <Row 
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={sliderStates.topRate.index}
              >               
                { 
                  topData?.results 
                  .slice(offset * sliderStates.topRate.index, offset * sliderStates.topRate.index + offset) 
                  .map((movie) => (
                    <Box
                    layoutId={movie.id + "topRate"}
                    key={movie.id}
                    whileHover="hover" 
                    initial="normal"
                    variants={boxVariants}
                    transition={{ type: "tween" }} 
                    onClick={() => onBoxClicked("topRate", movie.id)}
                    bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                    >
                      <Info 
                        variants={infoVariants}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
          </Slider>
          </SliderDiv>

        <SliderDiv>
        <SliderTitle>Upcoming!</SliderTitle> 
        <Slider>        
        <SliderBtn onClick={() => upcomingData && increaseIndex("upcoming", upcomingData)}>Next</SliderBtn>
        <AnimatePresence 
          initial={false} 
          onExitComplete={() => toggleLeaving("upcoming")}>
              <Row 
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={sliderStates.upcoming.index}
              >               
                { 
                  upcomingData?.results 
                  .slice(offset * sliderStates.upcoming.index, offset * sliderStates.upcoming.index + offset) 
                  .map((movie) => (
                    <Box
                    layoutId={movie.id + "upcoming"}
                    key={movie.id}
                    whileHover="hover" 
                    initial="normal"
                    variants={boxVariants}
                    transition={{ type: "tween" }} 
                    onClick={() => onBoxClicked("upcoming", movie.id)}
                    bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                    >
                      <Info 
                        variants={infoVariants}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
          </Slider>
          </SliderDiv>

          <AnimatePresence
          //얘는 bigMovieMatch가 true일 때만 나타남.
          //bigMovieMatch란 현재 경로가 써놓은 route와 맞는지를 확인해줌.
          //그러니까 bigMovieMatch가 true라는 건 박스를 클릭해서 id를 얻었다는 소리고
          //그 id에 맞는 정보를 가공하여 애니메이션을 띄워야 된다는 뜻이 됨.
          >
            {bigMovieMatch ? (
              //일단 두 개 컴포넌트 호출하기 위해 <> </> 요 유령 넣어주기
               <> 
               <Overlay
                 onClick={onOverlayClick}
                 exit={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
               />
               <BigMovie
               //내가 아무리 스크롤을 내렸더라도 그 스크롤에 맞는 위치에 카드가 뜨도록
               //scrollY 를 받아와서 상대적인 위치에다가 넣어준다.
               //get이라는 함수써서 숫자로 받아와야 +100 같이 보정해줄 수 있음.
                 style={{ top: scrollY.get() + 100 }}
                 layoutId={bigMovieMatch.params.movieId}
                 >
                 { //만약 클릭된 movie가 있다면 커버이미지, 타이틀, 개요를 만들어주기~
                  clickedMovie && (
                   <>
                     <BigCover
                       style={{
                         backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(
                           clickedMovie.backdrop_path,
                           "w500"
                         )})`,
                       }}
                     />
                     <BigTitle>{clickedMovie.title}</BigTitle>
                     <BigOverview>
                      {clickedMovie && (
                        <>
                        <p>Rating: {clickedMovie.vote_average.toFixed(1)}</p>
                        <p>Release_date: {clickedMovie.release_date}</p>
                        <p>Overview: {clickedMovie.overview}</p>
                        </>
                      )}
                      </BigOverview>
                   </>
                 )}
               </BigMovie>
             </>
           ) : null}
         </AnimatePresence>
      </>
      }
    </Wrapper>
  );
}
export default Home;