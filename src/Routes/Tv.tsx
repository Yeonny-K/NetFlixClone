import styled from "styled-components";
import { IGetShowResult, getOnTheAirShows, getAiringTodayShows, getPopularShows, getTopRatedShows } from "../api";
import { useQuery } from "react-query";
import {makeImagePath} from "./utils";
import { motion, AnimatePresence, useViewportScroll } from "framer-motion";
import { useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";



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
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(6, 1fr); 
  position: absolute;
  width: 100%;
`;

const Box = styled(motion.div)<{ bgPhoto: string }>`
  background-color: white;
  background-image: url(${(props) => props.bgPhoto});
  background-size: cover;
  background-position: center center;
  height: 200px;
  font-size: 66px;
  cursor: pointer;
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
  position: fixed; 
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;

const BigShow = styled(motion.div)`
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
  hidden: {
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
  normal: {
    scale: 1,
  },
  hover: {
    scale: 1.3,
    y: -80,
    transition: {
      delay: 0.5,
      duaration: 0.1,
      type: "tween", 
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


const offset = 6;

function Tv() {

  const { data : nowData, isLoading : nowLoading  } 
  = useQuery<IGetShowResult>(["shows", "nowPlaying"], getOnTheAirShows);
  const { data : todayData, isLoading : todayLoading  } 
  = useQuery<IGetShowResult>(["shows", "todayAiring"], getAiringTodayShows);
  const { data : popularData, isLoading : popularLoading  } 
  = useQuery<IGetShowResult>(["shows", "popular"], getPopularShows);
  const { data : topData, isLoading : topLoading  } 
  = useQuery<IGetShowResult>(["shows", "topRate"], getTopRatedShows);

  const [sliderStates, setSliderStates] = useState<{ [key: string]: { index: number, leaving: boolean } }>({
    nowPlaying: { index: 0, leaving: false },
    todayAiring: { index: 0, leaving: false },
    popular: {index:0, leaving: false},
    topRate: {index:0, leaving: false},
  });

  const increaseIndex = (slider: string, data: IGetShowResult) => {
    const { index, leaving } = sliderStates[slider];
    if (data && !leaving) {
      setSliderStates(prevStates => ({
        ...prevStates,
        [slider]: {
          ...prevStates[slider],
          leaving: true,
        }
      }));
      const totalShow = data.results.length - 1;
      const maxIndex = Math.floor(totalShow / offset) - 1;
      setSliderStates(prevStates => ({
        ...prevStates,
        [slider]: {
          ...prevStates[slider],
          index: index === maxIndex ? 0 : index + 1,
        }
      }));
    }
  };

  const toggleLeaving = (slider: string) => {
    setSliderStates(prevStates => ({
      ...prevStates,
      [slider]: {
        ...prevStates[slider],
        leaving: !prevStates[slider].leaving,
      }
    }));
  };


  const history = useHistory();
  const bigShowMatch = useRouteMatch<{ slider: string, showId: string }>("/tv/:slider/:showId");
  const onBoxClicked = (slider: string, showId: number) => {
    history.push(`/tv/${slider}/${showId}`);
  };

  const { scrollY } = useViewportScroll();
  const onOverlayClick = () => history.push("/tv");

  const clickedShow = 
  bigShowMatch?.params.showId && 
  (nowData?.results.find((show) => show.id === +bigShowMatch.params.showId!) || 
  todayData?.results.find((show) => show.id === +bigShowMatch.params.showId!) || 
  popularData?.results.find((show) => show.id === +bigShowMatch.params.showId!) || 
  topData?.results.find((show) => show.id === +bigShowMatch.params.showId!));


    return (
      <Wrapper>
        {nowLoading ? <Loader>Loading...</Loader>
        : 
        <>
          <Banner 
            bgPhoto = {makeImagePath(nowData?.results[0].backdrop_path || "")}> 
            <Title>{nowData?.results[0].name}</Title>
            <Overview>{nowData?.results[0].overview}</Overview>
          </Banner>

          <SliderDiv>
        <SliderTitle>Popular</SliderTitle> 
        <Slider>        
        <SliderBtn onClick={() => popularData && increaseIndex("popular", popularData)}>Next</SliderBtn>
        <AnimatePresence 
          initial={false} 
          onExitComplete={() => toggleLeaving("popular")}>
          
          <Row 
            variants={rowVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "tween", duration: 1 }}
            key={sliderStates.popular.index}
          >
            { 
                  popularData?.results 
                  .slice(1) 
                  .slice(offset * sliderStates.popular.index, offset * sliderStates.popular.index + offset) 
                  .map((show) => (
                    <Box
                    layoutId={show.id + "popular"}
                    key={show.id}
                    whileHover="hover" 
                    initial="normal"
                    variants={boxVariants}
                    transition={{ type: "tween" }} 
                    onClick={() => onBoxClicked("popular", show.id)}
                    bgPhoto={makeImagePath(show.backdrop_path, "w500")}
                    >
                      <Info 
                        variants={infoVariants}>
                        <h4>{show.name}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
          </Slider>
          </SliderDiv>
          
        <SliderDiv>
        <SliderTitle>On The Air</SliderTitle> 
        <Slider>        
        <SliderBtn onClick={() => nowData && increaseIndex("nowPlaying", nowData)}>Next</SliderBtn>
        <AnimatePresence 
          initial={false} 
          onExitComplete={() => toggleLeaving("nowPlaying")}>
          
          <Row 
            variants={rowVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "tween", duration: 1 }}
            key={sliderStates.nowPlaying.index}
          >
            { 
                  nowData?.results 
                  .slice(1) 
                  .slice(offset * sliderStates.nowPlaying.index, offset * sliderStates.nowPlaying.index + offset) 
                  .map((show) => (
                    <Box
                    layoutId={show.id + "nowPlaying"}
                    key={show.id}
                    whileHover="hover" 
                    initial="normal"
                    variants={boxVariants}
                    transition={{ type: "tween" }} 
                    onClick={() => onBoxClicked("nowPlaying", show.id)}
                    bgPhoto={makeImagePath(show.backdrop_path, "w500")}
                    >
                      <Info 
                        variants={infoVariants}>
                        <h4>{show.name}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
          </Slider>
          </SliderDiv>

        <SliderDiv>
        <SliderTitle>Airing Today</SliderTitle> 
        <Slider>        
        <SliderBtn onClick={() => todayData && increaseIndex("todayAiring", todayData)}>Next</SliderBtn>
        <AnimatePresence 
          initial={false} 
          onExitComplete={() => toggleLeaving("todayAiring")}>
          
          <Row 
            variants={rowVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "tween", duration: 1 }}
            key={sliderStates.todayAiring.index}
          >
            { 
                  todayData?.results 
                  .slice(1) 
                  .slice(offset * sliderStates.todayAiring.index, offset * sliderStates.todayAiring.index + offset) 
                  .map((show) => (
                    <Box
                    layoutId={show.id + "todayAiring"}
                    key={show.id}
                    whileHover="hover" 
                    initial="normal"
                    variants={boxVariants}
                    transition={{ type: "tween" }} 
                    onClick={() => onBoxClicked("todayAiring", show.id)}
                    bgPhoto={makeImagePath(show.backdrop_path, "w500")}
                    >
                      <Info 
                        variants={infoVariants}>
                        <h4>{show.name}</h4>
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
                  .slice(1) 
                  .slice(offset * sliderStates.topRate.index, offset * sliderStates.topRate.index + offset) 
                  .map((show) => (
                    <Box
                    layoutId={show.id + "topRate"}
                    key={show.id}
                    whileHover="hover" 
                    initial="normal"
                    variants={boxVariants}
                    transition={{ type: "tween" }} 
                    onClick={() => onBoxClicked("topRate", show.id)}
                    bgPhoto={makeImagePath(show.backdrop_path, "w500")}
                    >
                      <Info 
                        variants={infoVariants}>
                        <h4>{show.name}</h4>
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
            {bigShowMatch ? (
              //일단 두 개 컴포넌트 호출하기 위해 <> </> 요 유령 넣어주기
               <> 
               <Overlay
                 onClick={onOverlayClick}
                 exit={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
               />
               <BigShow
               //내가 아무리 스크롤을 내렸더라도 그 스크롤에 맞는 위치에 카드가 뜨도록
               //scrollY 를 받아와서 상대적인 위치에다가 넣어준다.
               //get이라는 함수써서 숫자로 받아와야 +100 같이 보정해줄 수 있음.
                 style={{ top: scrollY.get() + 100 }}
                 layoutId={bigShowMatch.params.showId}
                 >
                 { //만약 클릭된 movie가 있다면 커버이미지, 타이틀, 개요를 만들어주기~
                  clickedShow && (
                   <>
                     <BigCover
                       style={{
                         backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(
                           clickedShow.backdrop_path,
                           "w500"
                         )})`,
                       }}
                     />
                     <BigTitle>{clickedShow.name}</BigTitle>
                     <BigOverview>
                      {clickedShow && (
                        <>
                        <p>Rating: {clickedShow.vote_average.toFixed(1)}</p>
                        <p>Release_date: {clickedShow.first_air_date}</p>
                        <p>Overview: {clickedShow.overview}</p>
                        </>
                      )}
                      </BigOverview>
                   </>
                 )}
               </BigShow>
             </>
           ) : null}
         </AnimatePresence>
          
          
          </>
      }
    </Wrapper>
    );
  }
  export default Tv;