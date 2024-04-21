import { Link, useRouteMatch, useHistory } from "react-router-dom";
import styled from "styled-components";
import { motion, useAnimation, useViewportScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const Nav = styled(motion.nav)`
// 헤더에 들어갈 두가지 중 하나(로고, 메뉴 링크들)의 가장 큰 틀
// 스크롤에 따라 색상 변경을 해주기 위해서 motion 사용
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  width: 100%;
  top: 0;
  font-size: 14px;
  padding: 20px 60px;
  color: white;
`;
const Col = styled.div`
// 헤더에 들어갈 요소들의 틀 (메뉴, 링크들, 검색창 다 포함)
  display: flex;
  align-items: center;
`;

const Logo = styled(motion.svg)`
// 헤더 첫번째 큰 틀에 들어갈 로고, svg 사용함
// 로고에 애니메이션 사용할 거니까 motion. 사용
  margin-right: 50px;
  width: 95px;
  height: 25px;
  fill: ${(props) => props.theme.red};
  path {
    stroke-width: 6px;
    stroke: white;
  }
`;

const Items = styled.ul`
// 헤더 첫번째 큰 틀에 들어갈 링크들의 큰 틀 (홈, 시리즈, 영화 어쩌구 등등)
  display: flex;
  align-items: center;
`;

const Item = styled.li`
// 헤더 첫번째 큰 틀에 들어갈 링크들 각각에 부여될 속성
  margin-right: 20px;
  color: ${(props) => props.theme.white.darker};
  transition: color 0.3s ease-in-out;
  position: relative; //부모는 상대적인 위치를 가지게
  display: flex;
  justify-content: center;
  flex-direction: column;
  &:hover {
    color: ${(props) => props.theme.white.lighter};
  }
`;

const Search = styled.form`
  color: white;
  display: flex;
  align-items: center;
  position: relative; //생겼다 사라졌다 하는 거라서 상대적인 속성 주기
  svg {
    height: 25px;
  }
`;

const Circle = styled(motion.span)`
 //내가 지금 어느 메뉴에 위치해있는지 표시해줄 작은 동그라미
 //애니메이션 넣을거니까 motion. 사용해주기
  width: 5px;
  height: 5px;
  border-radius: 5px;
  bottom: -5px;
  position: absolute; //자식은 절대적인 위치를 가지게
  left: 0;
  right: 0;
  margin: 0 auto; 
  //무언가를 정중앙에 놓고 싶으면 position ~ margin까지 이 4가지 쓰면 된다!
  background-color: ${(props) => props.theme.red};
`;

const Input = styled(motion.input)`
//인풋창도 오->왼 생겨나는 애니메이션이 있으니까 motion. 사용해주기
  outline: none;
  transform-origin: right center; //변화가 시작되는 위치를 의미함. 변형이 오른쪽부터 일어나도록
  position: absolute;
  left: -185px;
  right: 0px;
  padding: 5px 10px;
  padding-left: 35px;
  z-index: -1;
  color: white;
  font-size: 16px;
  background-color: transparent;
  border: 1px solid ${(props) => props.theme.white.lighter};
  border-radius: 5px;
`;


const logoVariants = {
    //로고에 대한 애니메이션 정의
  normal: { //처음에는
    fillOpacity: 1,
  },
  active: { //마우스 올리면
    fillOpacity: [0, 1, 0], //근데 애니메이션을 반복시키고 싶음. 
    //마우스가 올라가 있는 동안에는 깜빡거리는 것처럼 보이게!
    //그러면 바꿀 오파셔티를 저렇게 배열로 준 다음에
    //아래에 transtion을 넣고 속성을 영원하도록 부여한다.
    transition: {
      repeat: Infinity,
    },
  },
};

const navVariants = {
    top: { //처음 색상
      backgroundColor: "rgba(0, 0, 0, 0)",
    },
    scroll: { //스크롤해서 내려가면 보여줄 색상
      backgroundColor: "rgba(0, 0, 0, 1)",
    },
  };

  interface IForm {
    //Form에 String형 들어올 거라고 알려주기
    keyword: string;
  }
  

function Header() {
    //useRouteMatch : 내가 지금 어디있는지 알려주는 것!
    const homeMatch = useRouteMatch("/");
    const tvMatch = useRouteMatch("/tv");

    // 돋보기모양 아이콘 '클릭'하면 무언가 보이게 하는 거니까,
    // '클릭'상태를 저장할 State랑, 클릭했을 때 토글해줄 함수 만들어주기.
    const [searchOpen, setSearchOpen] = useState(false);

    const inputAnimation = useAnimation();
    const navAnimation = useAnimation();

    // 스크롤을 움직일 때 우리가 얼마나 많이 내려왔는지 추적해줌.
    // 그냥 Y랑 progressY가 있음. 픽셀 단위 / 소수점 단위 차이임
    const { scrollY } = useViewportScroll();


    //Search Form에 들어갈 값을 받아오기
    //그리고 Search Form에 넣은 값을 토대로 url 이동시켜주기
    const history = useHistory();
    const { register, handleSubmit } = useForm<IForm>();
    const onValid = (data: IForm) => {
      history.push(`/search?keyword=${data.keyword}`);
    };

    // 애니메이션단 말고 함수단에서 애니메이션 실행하는 방법으로 해보기
    const toggleSearch = () => {
      if (searchOpen) {
        inputAnimation.start({
          scaleX: 0,
        });
      } else {
        inputAnimation.start({ scaleX: 1 });
      }
      setSearchOpen((prev) => !prev);
    };

    //scrollY값에 따라 애니메이션을 주기 위해 사용
    useEffect(() => {
      scrollY.onChange(() => {
        if (scrollY.get() > 80) {
            //스크롤이 80을 넘어가면 scroll 애니메이션 실행하고
          navAnimation.start("scroll");
        } else {
            //처음에는 초기값 애니메이션 실행하기
          navAnimation.start("top");
        }
      });
    }, [scrollY, navAnimation]);

    return (
      <Nav 
        variants={navVariants} 
        animate={navAnimation} 
        initial={"top"}>
        <Col>
          <Logo
            variants={logoVariants}
            whileHover="active" //마우스가 올라가면 작동할 애니메이션
            initial="normal"
            xmlns="http://www.w3.org/2000/svg"
            width="1024"
            height="276.742"
            viewBox="0 0 1024 276.742"
          >
            <motion.path d="M140.803 258.904c-15.404 2.705-31.079 3.516-47.294 5.676l-49.458-144.856v151.073c-15.404 1.621-29.457 3.783-44.051 5.945v-276.742h41.08l56.212 157.021v-157.021h43.511v258.904zm85.131-157.558c16.757 0 42.431-.811 57.835-.811v43.24c-19.189 0-41.619 0-57.835.811v64.322c25.405-1.621 50.809-3.785 76.482-4.596v41.617l-119.724 9.461v-255.39h119.724v43.241h-76.482v58.105zm237.284-58.104h-44.862v198.908c-14.594 0-29.188 0-43.239.539v-199.447h-44.862v-43.242h132.965l-.002 43.242zm70.266 55.132h59.187v43.24h-59.187v98.104h-42.433v-239.718h120.808v43.241h-78.375v55.133zm148.641 103.507c24.594.539 49.456 2.434 73.51 3.783v42.701c-38.646-2.434-77.293-4.863-116.75-5.676v-242.689h43.24v201.881zm109.994 49.457c13.783.812 28.377 1.623 42.43 3.242v-254.58h-42.43v251.338zm231.881-251.338l-54.863 131.615 54.863 145.127c-16.217-2.162-32.432-5.135-48.648-7.838l-31.078-79.994-31.617 73.51c-15.678-2.705-30.812-3.516-46.484-5.678l55.672-126.75-50.269-129.992h46.482l28.377 72.699 30.27-72.699h47.295z" />
          </Logo>
          <Items>
            <Item>
              <Link to="/">Home {/* 홈과 연결되는 링크를 아이템(각 메뉴 컴포넌트)이랑 연결 */}
                { //Home에서는 조금 다르게 확인해줘야 한다. 라우터 상에 / 가 제일 아래에 있으니까, 홈은 tv로 가도 항상 존재하게 됨.
                 // url 보면 /tv 로 붙지 그냥 tv로 붙지 않잖아?
                 // 그래서 Home은 tvMatch처럼 단순하게 &&를 바로 찍지 않고 ?.isExact가 붙는다.

                 //플러스로, Circle이 당구공처럼 옮겨다닐 수 있게 
                 //Circle들끼리서로 같은 layoutId 부여해주기
                    homeMatch?.isExact && <Circle layoutId="circle" />}
              </Link>
            </Item>
            <Item>
              <Link to="/tv">Tv Shows {/* tv랑 연결되는 링크를 아이템(각 메뉴 컴포넌트)이랑 연결 */}
                { //만약 tvMatch가 true라면 Circle 표현해주기 

                //플러스로, Circle이 당구공처럼 옮겨다닐 수 있게 
                 //Circle들끼리서로 같은 layoutId 부여해주기
                    tvMatch && <Circle layoutId="circle" />}
              </Link>
            </Item>
          </Items>
        </Col>
        <Col>
        <Search onSubmit={handleSubmit(onValid)}> {/* 검색할 수 있는 아이콘 클릭하면 애니메이션 실행. 
                    아이콘 사용하니까 Search 밑에 svg 넣어주고 */}
          <motion.svg
            onClick={toggleSearch} //svg에 onClick 함수 넣어주기. 클릭했니 안했니 확인하는 거
            animate={{ x: searchOpen ? -180 : 0 }} //인풋창이 열릴 때 아이콘도 같이 옆으로 가도록
            transition={{ type: "linear" }} //같이 움직여야 하는 것들끼리 linear 속성줘서 선형으로 움직이게
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            ></path>
          </motion.svg>
          <Input //motion.svg에 걸어놓은 onClick 함수 실행 여부에 따라 이 input이 생겼다 말았다 할 것임
          //input폼이랑 register 연결해주기
            {...register("keyword", { required: true, minLength: 2 })}
            animate={inputAnimation}
            initial={{ scaleX: 0 }}
            transition={{ type: "linear" }}
            placeholder="Search Keywords"
          />
          </Search>
        </Col>
      </Nav>
    );
  }
  
  export default Header;