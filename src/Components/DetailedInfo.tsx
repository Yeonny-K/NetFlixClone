import styled from "styled-components";
import { IGetMovieDetail, getDetail } from "../api";
import { useQuery } from "react-query";

const DetailDiv = styled.div`
    position: relative;
    padding-top: 30px;
    padding-left: 30px;
    width: 90%;
    top: -100px;
    font-size: 18px;
    font-weight: 500;
`;

export default function MovieInfo({ videoId }: { videoId: string }) {
    const { data, isLoading, isError } = useQuery<IGetMovieDetail>(
        ["movie", "detail"],
        () => getDetail("movie", videoId)
    );
    
    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error fetching data</div>;

    if (!data) return <div>No data available</div>;

    return(
        <DetailDiv>
            <p>Genres : {data.genres?.map((genre) => genre.name + " / ")}</p>
            <p>Overview : {data.overview}</p>
            <p>Rating : {data.vote_average?.toFixed(1)} / 10</p>
        </DetailDiv>
    );
}