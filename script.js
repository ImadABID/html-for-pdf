
// Add page header and footer
/*
    header and footer are functions with the following prototype:
        string header(page_nbr);
*/
const add_header_and_footer = (header, footer, debug=false)=>{

    let page_layout_tab = document.getElementById('page_A4_layout_table');

    console.log(page_layout_tab.children[0].children[0].children[0].outerHTML)

    let page_i = 0;
    let pages = document.getElementsByClassName('page_A4');
    
    let tr_i = 0;

    Array.prototype.filter.call(
        pages,
        (page) => {

            tr_i = 0;

            for(const tr of page_layout_tab.children[0].children){

                console.log(page_layout_tab.children.length);

                switch(tr_i){

                    case 0:
                        for(const td of tr.children){
                            td.innerHTML = header(page_i);
                            if(debug){
                                td.style['background-color'] = 'rgb(255, 200, 208)';
                            }
                        }
                        break;

                    case 1:
                        for(const td of tr.children){
                            td.innerHTML = page.innerHTML;
                            if(debug){
                                td.style['background-color'] = 'rgb(208, 200, 255)';
                            }
                        }
                        break;

                    case 2:
                        for(const td of tr.children){
                            td.innerHTML = footer(page_i);
                            if(debug){
                                td.style['background-color'] = 'rgb(200, 208, 255)';
                            }
                        }
                        break;

                    default :
                        console.log("error : layout table contains more than 3 td.")
                        break;

                }

                tr_i++;

            }

            page_i++;

            page.innerHTML = page_layout_tab.outerHTML;

        }
    );

}

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