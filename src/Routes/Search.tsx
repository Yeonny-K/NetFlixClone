import { useQuery } from "react-query";
import styled from "styled-components";
import { motion, AnimatePresence, useViewportScroll } from "framer-motion";
import { 
    getSearchMovies, 
    getSearchShows, 
    IGetMovieResult,
    IGetShowResult, } from "../api";
import { makeImagePath } from "./utils";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useHistory, useRouteMatch } from "react-router-dom";


const Wrapper = styled.div`
  background: black;
  padding-bottom: 200px;
  overflow-x: hidden; //x축 스크롤바 안 생기게
`;

const Smallwrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

const SearchDiv = styled.div`
    height: 250px;
    font-size: 35px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #413636;
    background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1));
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
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

function Search() {
    const location = useLocation();
    const keyword = new URLSearchParams(location.search).get("keyword");
    const [nowkeyword, setnowkeyword] = useState(keyword);
    

    const history = useHistory();
    const bigMovieMatch = useRouteMatch<{movieId: string }>("/search/movie/:movieId");
    const onMovieClicked = (movieId: number) => {
      history.push(`/search/movie/${movieId}?keyword=${keyword}`);
    };
    const bigShowMatch = useRouteMatch<{showId: string }>("/search/tv/:showId");
    const onShowClicked = (showId: number) => {
      history.push(`/search/tv/${showId}?keyword=${keyword}`);
    };
    const onOverlayClick = () => history.push(`/search?keyword=${keyword}`);

    const {
        data: movieSearch,
        isLoading: movieSearchLoading,
        refetch: movieRefetch,
    } = useQuery<IGetMovieResult>(["searchmovies", "nowPlaying"], () =>
        getSearchMovies(String(keyword))
    );

    const {
        data: showSearch,
        isLoading: showSearchLoading,
        refetch: showRefetch,
    } = useQuery<IGetShowResult>(["searchshows", "nowPlaying"], () =>
        getSearchShows(String(keyword))
    );

    console.log(movieSearch);

    const [movieIndex, setMovieIndex] = useState(0);
    const [showIndex, setShowIndex] = useState(0);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        movieRefetch();
        showRefetch();
        setLeaving(false);
        setnowkeyword(keyword);
    }, [keyword, movieRefetch, showRefetch]);

    const movieSlider = () => {
        if (movieSearch) {
          if (leaving) return;
          toggleLeaving();
          const totalMovies = movieSearch.results.length;
          const maxIndex = Math.floor(totalMovies / offset);
          setMovieIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        }
    };

    const showSlider = () => {
        if (showSearch) {
          if (leaving) return;
          toggleLeaving();
          const totalShows = showSearch.results.length;
          const maxIndex = Math.floor(totalShows / offset);
          setShowIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        }
    };

    const toggleLeaving = () => setLeaving((prev) => !prev);

    const clickedMovie = 
    bigMovieMatch?.params.movieId && 
    (movieSearch?.results.find((movie) => movie.id === +bigMovieMatch.params.movieId!));
    
    const clickedShow = 
    bigShowMatch?.params.showId && 
    (showSearch?.results.find((show) => show.id === +bigShowMatch.params.showId!));

    const { scrollY } = useViewportScroll();

    return (
    <Wrapper>
        {movieSearchLoading && showSearchLoading ? (
        <Loader>Loading...</Loader>
        ) : (
            <Smallwrapper>
                <SearchDiv>
                    { keyword === nowkeyword ? 
                    `Search results about "${nowkeyword}".`             
                    : "No keyword."}
                </SearchDiv>

                <SliderDiv>
                    <SliderTitle> Searched Movies</SliderTitle>
                    <Slider>
                        <SliderBtn onClick={movieSlider}>Next</SliderBtn>
            
                        <AnimatePresence 
                          initial={false} 
                          onExitComplete={toggleLeaving}>

                            <Row
                            variants={rowVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ type: "tween", duration: 1 }}
                            key={movieIndex}
                            >
                            {movieSearch?.results
                                .slice(0)
                                .slice(offset * movieIndex, offset * movieIndex + offset)
                                .map((movie) => (
                                <Box
                                layoutId={movie.id + ""}
                                key={movie.id}
                                whileHover="hover"
                                initial="normal"
                                variants={boxVariants}
                                onClick={() => onMovieClicked(movie.id)}
                                transition={{ type: "tween" }}
                                bgPhoto={makeImagePath(movie.poster_path, "w500")}
                                >
                                    <Info variants={infoVariants}>
                                    <h4>{movie.title}</h4>
                                    </Info>
                                </Box>
                                ))}
                            </Row>
                        </AnimatePresence>
                    </Slider>
                </SliderDiv>

                <SliderDiv>
                    <SliderTitle> Searched Shows</SliderTitle>
                    <Slider>
                        <SliderBtn onClick={showSlider}>Next</SliderBtn>
            
                        <AnimatePresence 
                          initial={false} 
                          onExitComplete={toggleLeaving}>

                            <Row
                            variants={rowVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ type: "tween", duration: 1 }}
                            key={showIndex}
                            >
                            {showSearch?.results
                                .slice(0)
                                .slice(offset * showIndex, offset * showIndex + offset)
                                .map((show) => (
                                <Box
                                layoutId={show.id + ""}
                                key={show.id}
                                whileHover="hover"
                                initial="normal"
                                variants={boxVariants}
                                onClick={() => onShowClicked(show.id)}
                                transition={{ type: "tween" }}
                                bgPhoto={makeImagePath(show.poster_path, "w500")}
                                >
                                    <Info variants={infoVariants}>
                                    <h4>{show.name}</h4>
                                    </Info>
                                </Box>
                                ))}
                            </Row>
                        </AnimatePresence>
                    </Slider>
                </SliderDiv>

                <AnimatePresence>
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

         <AnimatePresence>
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
                

            </Smallwrapper>
        )}
    </Wrapper>
  );
}

export default Search;