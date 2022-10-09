const page_layout_tab = document.getElementById('page_A4_layout_table');
const invisible_footer = document.getElementById('invisible_footer');

let main_content_height = null;

// Make page conform (Add headers and footer)
const make_A4_page_conform = (page, debug=false) => {

    const is_A4_page_conform = (page_)=>{
        return page_.children[0] && page_.children[0].id === "page_A4_layout_table";
    }

    /*
    Returns page height in mm without unit
    */
    const setup_A4_page_layout = (page)=>{

        let layout = getComputedStyle(document.documentElement).getPropertyValue('--layout');
        let padding = getComputedStyle(document.documentElement).getPropertyValue('--padding');

        padding_in_mm_int = parseInt(padding.slice(0, -2));

        if(layout === ' landscape'){
            page.style['width'] = `${297-2*padding_in_mm_int}mm`;
            page.style['height'] = `${210-2*padding_in_mm_int}mm`;
            return 210-2*padding_in_mm_int
        }else{
            page.style['width'] = `${210-2*padding_in_mm_int}mm`;
            page.style['height'] = `${297-2*padding_in_mm_int}mm`;
            return 297-2*padding_in_mm_int
        }

    }

    if(is_A4_page_conform(page)){
        return;
    }

    let page_height = setup_A4_page_layout(page);

    let header_footer_height = getComputedStyle(document.documentElement).getPropertyValue('--header_footer_height');

    let tr_i = 0;

    for(const tr of page_layout_tab.children[0].children){

        switch(tr_i){

            case 0:
                for(const td of tr.children){
                    td.innerHTML = "";
                    td.style['height'] = header_footer_height;
                    if(debug){
                        td.style['background-color'] = 'rgb(255, 200, 208)';
                    }
                }
                break;

            case 1:
                for(const td of tr.children){
                    td.innerHTML = page.innerHTML;
                    td.style['height'] = `${page_height-2*parseInt(header_footer_height.slice(0,-2))}mm`;
                    if(debug){
                        td.style['background-color'] = 'rgb(208, 200, 255)';
                    }
                }
                break;

            case 2:
                for(const td of tr.children){
                    td.innerHTML = "";
                    td.style['height'] = header_footer_height;
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

    if(main_content_height === null){
        main_content_height = get_page_element(page, 1).clientHeight;
    }

}

const get_page_element = (page, element_index)=>{
    return page.children[0].children[0].children[element_index].children[0];
}

// content_sections to A4 pages
const content2A4pages = (header_footer_debug=false)=>{

    const append_ele_to_page = (page, element) => {

        let page_content = get_page_element(page, 1);

        page_content.appendChild(element)
        element.insertAdjacentHTML('afterend', invisible_footer.outerHTML);


        if(page_content.scrollHeight > main_content_height){
            page_content.removeChild(page_content.lastChild);
            page_content.removeChild(page_content.lastChild);
            return false
        }

        page_content.removeChild(page_content.lastChild);

        return true;

    }

    const section2A4pages = (section, last_page, use_a_new_page=false)=>{

        const new_A4_page = (precedent_page)=>{
            precedent_page.insertAdjacentHTML('afterend', '<div class="page_A4"></div>');
            let new_page = precedent_page.nextSibling;
            make_A4_page_conform(new_page, header_footer_debug);

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

                    let inserted = false;
                    while(!inserted && dec > 0){

                        page = page.nextSibling;
                        dec --;

                        inserted = append_ele_to_page(page, ele);
                    
                    }

                    if(!inserted){
                        page = new_A4_page(page);
                        page_for_figure = page;

                        if(!append_ele_to_page(page, ele)){
                            console.log('error cannot display a contenet in one page.')
                        }
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

                last_page = section2A4pages(body_child, last_page, use_a_new_page);
                use_a_new_page = false;

                break;

            case 'next_page':

                if(body_child.innerHTML === 'Processed')
                    break;

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
        get_page_element(page, 0).innerHTML = header(page_i, pages.length);
        get_page_element(page, 2).innerHTML = footer(page_i, pages.length);
        page_i++;
    }

}

// Figures
const plot_figure = ()=>{
				
    let fig;
    let fig_title_div;
    let fig_title_str;
    let figures_div = document.getElementsByClassName('figure');

    let figures_labels = document.getElementsByClassName('figure_label');

    for(let i = 0; i < figures_div.length; i++){
        
        // Edit figure title
        fig = figures_div[i];
        fig_title_str = `<br><span class="fig_title"><span class="fig_nbr">fig ${i+1} - </span>${fig.title}</span>`;

        // edit label
        for(let j = 0; j < figures_labels.length; j++){

            if(figures_div[i].id === figures_labels[j].id){
                figures_labels[j].innerHTML = `(fig ${i+1})`;
            }
        }

        fig_title_div = document.createElement('div');
        fig_title_div.classList.add('fig_title_div');
        fig_title_div.innerHTML = fig_title_str
        
        fig.appendChild(fig_title_div);
    }

}

// biblio
var biblio_str;

const biblio_num = ()=>{
    biblio_str = "<table>";
    const ref_num_tab = document.getElementsByClassName('bibliography');
    let index = 1;
    let in_list_ele;
    for(let i = 0; i < ref_num_tab.length; i++){
        in_list_ele = document.getElementById(`in_list_${ref_num_tab[i].id}`);
        if(in_list_ele === null){
            biblio_add_to_list(ref_num_tab[i].id, index);
            ref_num_tab[i].innerHTML = `[${index}]`;
            index++;
        }else{
            ref_num_tab[i].innerHTML = document.getElementById(`in_list_${ref_num_tab[i].id}`).innerHTML;
        }
    }
}
const biblio_update = ()=>{
    let biblio = document.getElementById('biblio_list');
    biblio.innerHTML = biblio_str+"</table>";
}
const biblio_add_to_list= (id, index)=>{
    for(let i = 0; i < bibliography.length; i++){
        if(id === bibliography[i].id){
            biblio_str+=`<tr><td id='in_list_${bibliography[i].id}''>[${index}]</td><td>${bibliography[i].biblio}</td></tr>`;
            biblio_update();
            break;
        }
    }
}
const biblio_print = ()=>{
    biblio_num();
    biblio_update();
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
biblio_print();