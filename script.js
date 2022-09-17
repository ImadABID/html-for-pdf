
/* Debug */
const debug_page_alignment = ()=>{
    let i = 0;
    let pages = document.getElementsByClassName('page_A4');
    
    Array.prototype.filter.call(
        pages,
        (page) => {
            if(i%2 == 0){
                page.style['background-color'] = 'rgb(247, 137, 137)';
            }else{
                page.style['background-color'] = 'rgb(137, 247, 165)';
            }
            i++;
        }
    );
}