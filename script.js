const page_layout_tab = document.getElementById('page_A4_layout_table');

// Make page conform (Add headers and footer)
const make_A4_page_conform = (page, debug=false) => {

    const is_A4_page_conform = (page_)=>{
        return page_.children[0] && page_.children[0].id === "page_A4_layout_table";
    }

    if(is_A4_page_conform(page)){
        return;
    }

    let tr_i = 0;

    for(const tr of page_layout_tab.children[0].children){

        switch(tr_i){

            case 0:
                for(const td of tr.children){
                    td.innerHTML = "";
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
                    td.innerHTML = "";
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

    page.innerHTML = page_layout_tab.outerHTML;

}

const get_page_element = (page, element_index)=>{
    return page.children[0].children[0].children[element_index].children[0];
}

let page_A4_layout = document.getElementById('page_A4_layout');
let main_content_height = get_page_element(page_A4_layout, 1).clientHeight;

// content_sections to A4 pages
const content2A4pages = (header_footer_debug=false)=>{

    const append_ele_to_page = (page, element) => {

        let page_content = get_page_element(page, 1);

        page_content.appendChild(element)


        if(page_content.scrollHeight > 876){
            page_content.removeChild(page_content.lastChild);
            return false
        }

        return true;

    }

    const section2A4pages = (section, last_page, use_a_new_page=false)=>{

        const new_A4_page = (precedent_page)=>{
            precedent_page.insertAdjacentHTML('afterend', '<div class="page_A4"></div>');
            let new_page = precedent_page.nextSibling;
            make_A4_page_conform(new_page, header_footer_debug);
            
            if(main_content_height == null){
                main_content_height = get_page_element(new_page, 1).clientHeight;
            }

            return new_page;
        }

        let page;
        let page_for_figure;

        if(use_a_new_page){
            page = new_A4_page(last_page);
        }else{
            page = last_page;
        }

        page_for_figure = page;

        // figure vs normal_content page decalage
        let dec = 0;

        let ele;
        while(section.children.length > 0){

            ele = section.children[0];

            if(ele.className === 'figure'){

                if(!append_ele_to_page(page_for_figure, ele)){
                    page_for_figure = new_A4_page(page_for_figure);
                    dec++;

                    if(!append_ele_to_page(page_for_figure, ele)){
                        console.log('error cannot display a figure in one page.')
                    }
                }

            }else{

                if(!append_ele_to_page(page, ele)){

                    if(dec === 0){
                        page = new_A4_page(page);
                        page_for_figure = page;
                    }else{
                        page = page.nextSibling;
                        dec --;
                    }

                    if(!append_ele_to_page(page, ele)){
                        console.log('error cannot display a contenet in one page.')
                    }

                }

            }
        
        }

        return page_for_figure;

    }
    
    let body_children = document.getElementById('body').children;

    let last_page = null;

    let use_a_new_page = false;

    for(let body_child of body_children){

        switch(body_child.className){
            
            case 'page_A4':
                make_A4_page_conform(body_child, header_footer_debug);
                last_page = body_child;
                break;

            case 'content_section':
            
                if(body_child.children.length === 0)
                    break;

                // console.log('-----')
                // console.log(body_child.outerHTML);
                last_page = section2A4pages(body_child, last_page, use_a_new_page);
                use_a_new_page = false;

                break;

            case 'next_page':

                if(body_child.innerHTML === 'Processed')
                    break;

                console.log('next_page')
                use_a_new_page = true;
                body_child.innerHTML = 'Processed'
                break;
        }

    }

    // remove section
    let sections = document.getElementsByClassName('content_section');

    while(sections.length>0){
        document.getElementById('body').removeChild(sections[0]);
    }

    // remove next_page
    let next_pages = document.getElementsByClassName('next_page');

    while(next_pages.length>0){
        document.getElementById('body').removeChild(next_pages[0]);
    }

}

// Add page header and footer
/*
    header and footer are functions with the following prototype:
        string header(page_nbr);
*/
const add_header_and_footer = (header, footer)=>{

    
    let pages = document.getElementsByClassName('page_A4');

    let page_i = 0;
    for(let page of pages){
        get_page_element(page, 0).innerHTML = header(page_i);
        get_page_element(page, 2).innerHTML = footer(page_i);
        page_i++;
    }

}

// Figures
const plot_figure = ()=>{
				
    let fig;
    let fig_title_div;
    let fig_title_str;
    let figures_div = document.getElementsByClassName('figure');
    for(let i = 0; i < figures_div.length; i++){
        
        fig = figures_div[i];
        fig_title_str = `<br><span class="fig_title"><span class="fig_nbr">fig${i+1} - </span>${fig.title}</span>`;

        fig_title_div = document.createElement('div');
        fig_title_div.classList.add('fig_title_div');
        fig_title_div.innerHTML = fig_title_str
        
        fig.appendChild(fig_title_div);
    }

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

// Main

content2A4pages();
plot_figure();