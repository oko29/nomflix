import styled from "styled-components";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { useState } from "react";
import { useMatch, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { getMovies, IGetMoviesResult } from "../api";
import { makeImagePath } from "../utils";

import {
  BsFillPlayFill,
  BsPlus,
  BsVolumeMute,
  BsVolumeUp,
} from "react-icons/bs";
import { FiChevronDown } from "react-icons/fi";
import { HiOutlineThumbUp } from "react-icons/hi";
import { MdOutlineCancel } from "react-icons/md";

const Wrapper = styled.div`
  background: black;
  padding-bottom: 200px;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 90px;
  color: red;
`;
const Banner = styled.div<{ bgPhoto: string }>`
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
  font-size: 68px;
  margin-bottom: 20px;
`;
const Overview = styled.p`
  font-size: 30px;
  width: 50%;
`;

const Slider = styled.div`
  position: relative;
  top: -100px;
`;
const Row = styled(motion.div)`
  position: absolute;
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(6, 1fr);
  width: 100%;
`;
const Box = styled(motion.div)<{ bgPhoto: string }>`
  position: relative;
  height: 200px;
  background-color: white;
  background-image: url(${(props) => props.bgPhoto});
  background-size: cover;
  background-position: center center;
  font-size: 66px;
  cursor: pointer;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
  &:hover {
    z-index: 5;
  }
`;

const Info = styled(motion.div)`
  width: 100%;

  position: absolute;
  bottom: -120px;
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  color: white;
  h4 {
    text-align: center;
    font-size: 18px;
    margin-bottom: 5px;
  }
  h5 {
    font-size: 14px;
    margin-bottom: 5px;
  }
`;

const BtnWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  &.modal {
    position: relative;
    padding: 20px;
    top: -180px;
  }
`;
const BtnColumn = styled.div`
  display: flex;
  align-items: center;
`;

const Btn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 5px;
  font-size: 36px;
  border: 1px solid lightgray;
  color: white;
  background-color: transparent;
  cursor: pointer;
  &.play {
    background-color: #e6dddd;
    color: black;
    &:hover {
      background-color: white;
    }
  }
  &.modal {
    width: 100px;
    border-radius: 10px;
    font-size: 20px;
    font-weight: 600;
  }
  &.cancel {
    position: absolute;
    top: 10px;
    right: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    opacity: 0.6;
    width: auto;
    height: auto;
    font-size: 48px;
    &:hover {
      opacity: 1;
    }
  }
  &:hover {
    border-color: white;
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

const BigCover = styled.div`
  width: 100%;
  height: 300px;
  background-size: cover;
  background-position: center center;
`;

const BigTitle = styled.h3`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  font-size: 46px;
  position: relative;
  top: -180px;
`;

const BigOverview = styled.p`
  padding: 20px;
  position: relative;
  top: -180px;
  color: ${(props) => props.theme.white.lighter};
  h5 {
    font-size: 24px;
    margin-bottom: 10px;
  }
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
    scale: 1.5,
    y: -80,
    transition: {
      delay: 0.5,
      duration: 0.3,
      type: "tween",
    },
  },
};

const infoVariants = {
  hover: {
    opacity: 1,
    transition: {
      delay: 0.5,
      duration: 0.3,
      type: "tween",
    },
  },
};

const offset = 6;

function Home() {
  const [volumeOn, setVolumeOn] = useState(false);
  const navigate = useNavigate();
  const bigMovieMatch = useMatch("/movies/:movieId");
  const { data, isLoading } = useQuery<IGetMoviesResult>(
    ["movies", "nowPlaying"],
    getMovies
  );
  console.log(data?.results);
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const { scrollY } = useScroll();

  const increaseIndex = () => {
    if (data) {
      if (leaving) return;
      toggleLeaving();
      const totalMovies = data.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };

  const toggleLeaving = () => setLeaving((prev) => !prev);
  const toggleVolume = () => setVolumeOn((prev) => !prev);
  const onBoxClicked = (movieId: number) => {
    navigate(`/movies/${movieId}`);
  };
  const onMoveHome = () => {
    navigate("/");
  };
  const clickedMovie =
    bigMovieMatch?.params.movieId &&
    data?.results.find(
      (movie) => movie.id + "" === bigMovieMatch.params.movieId
    );
  return (
    <Wrapper>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner
            onClick={increaseIndex}
            bgPhoto={makeImagePath(data?.results[0].backdrop_path || "")}
          >
            <Title>{data?.results[0].title}</Title>
            <Overview>{data?.results[0].overview}</Overview>
          </Banner>
          <Slider>
            <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
              <Row
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={index}
              >
                {data?.results
                  .slice(1)
                  .slice(offset * index, offset * index + offset)
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + ""}
                      onClick={() => onBoxClicked(movie.id)}
                      key={movie.id}
                      variants={boxVariants}
                      initial="normal"
                      whileHover="hover"
                      transition={{ type: "tween" }}
                      bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                    >
                      <Info variants={infoVariants}>
                        <BtnWrapper>
                          <BtnColumn>
                            <Btn className="play">
                              <BsFillPlayFill />
                            </Btn>
                            <Btn>
                              <BsPlus />
                            </Btn>
                            <Btn>
                              <HiOutlineThumbUp />
                            </Btn>
                          </BtnColumn>
                          <BtnColumn>
                            <Btn>
                              <FiChevronDown />
                            </Btn>
                          </BtnColumn>
                        </BtnWrapper>
                        <h4>{movie.title}</h4>
                        <h5>개봉일 : {movie.release_date}</h5>
                        <h5>평점 : {movie.vote_average}</h5>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
          </Slider>
          <AnimatePresence>
            {bigMovieMatch ? (
              <>
                <Overlay
                  onClick={onMoveHome}
                  exit={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
                <BigMovie
                  style={{ top: scrollY.get() + 100 }}
                  layoutId={bigMovieMatch.params.movieId}
                >
                  {clickedMovie && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(
                            clickedMovie.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      >
                        <Btn onClick={onMoveHome} className="cancel">
                          <MdOutlineCancel />
                        </Btn>
                      </BigCover>
                      <BigTitle>{clickedMovie.title}</BigTitle>
                      <BtnWrapper className="modal">
                        <BtnColumn>
                          <Btn className="play modal">
                            <BsFillPlayFill size={36} />
                            재생
                          </Btn>
                          <Btn>
                            <BsPlus />
                          </Btn>
                          <Btn>
                            <HiOutlineThumbUp />
                          </Btn>
                        </BtnColumn>
                        <BtnColumn>
                          <Btn onClick={toggleVolume}>
                            {volumeOn ? <BsVolumeUp /> : <BsVolumeMute />}
                          </Btn>
                        </BtnColumn>
                      </BtnWrapper>

                      <BigOverview>
                        <h5>개봉일 : {clickedMovie.release_date}</h5>
                        <h5>평점 : {clickedMovie.vote_average}</h5>
                        {clickedMovie.overview}
                      </BigOverview>
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Home;
