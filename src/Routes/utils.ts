export function makeImagePath(id: string, format?:string){
    //format이 있을 수도 있고 없을 수도 있어서 ?를 달아주고
    //있을 경우 format 쓰고 없을 경우 original을 붙여주려고 함
    return `https://image.tmdb.org/t/p/${format?format:"original"}/${id}`;
};