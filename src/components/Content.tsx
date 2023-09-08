import React, {useState, useEffect} from "react";
import { useParams } from "react-router-dom";
import request from '../utils/request'
import {AppContext} from '../app'
import { useNavigate } from "react-router-dom";
import $ from 'jquery';
import { connect } from 'react-redux';

interface ContentProps {
    id: string
} 

let scrollValue = 0;

const mapStateToProps = (state:any) => {
    return {
      isAuth: state.isAuthenticated
    }
  }

  function ParseUrl(){
    var fragmentString = location.hash.substring(1);
  
    // Parse query string to see if page request is coming from OAuth 2.0 server.
    var params: any = {};
    var regex = /([^&=]+)=([^&]*)/g, m;
    while (m = regex.exec(fragmentString)) {
        params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    if (Object.keys(params).length > 0) {
        console.log('oauth2-test-params', JSON.stringify(params));
        console.log("state", params['state']);
        //localStorage.setItem('oauth2-test-params', JSON.stringify(params) );
        if (params['state'] && params['state'] == 'try_sample_request') {
          return params;
        //trySampleRequest();
        }
        return false;
    }
  }

let result = "";

function Content(props: any){
    const context = React.useContext(AppContext);
    const {id = ''} = useParams(),
          [__content, setContent] = useState("");
    let navigate = useNavigate();
    
    useEffect(()=>{
        if(context.settings.hasOwnProperty("start_page") && context.settings.start_page.name!="" && id=="")
            navigate("/"+context.settings.start_page.name);
    }, [context]);

    useEffect(()=>{
        if(id=="" && props.isAuth!=0) return;
        request({method: "post", data:{action: "getPage", data: {page_id: id}}}).then( response =>{
            const {data} = response;
            if(data.private==1 && !props.isAuth) navigate("/auth");
            if(data.head_title!="" && data.head_title!=null)
               document.title = data.head_title;
            else
                document.title = "ПДД онлайн 2023";
            let regexp = /(font\-)?size[=\:][\'\"]?\s?([^\'\";]*)[\'\"]?/sg,
                content = data.content;
            
            
            $(document).on('click', '.contentItem', function(this: HTMLElement){
                const cid = 'citem'+$(this).attr('id');
                $('#' + cid)[0].scrollIntoView(true);
            });
            
            context.setPageTitle(data.title);
            if(content){
                result = content.replace(regexp, (match: string, fullform: string, fontsize: string)=>{ 
                let fontStyleName = (fullform!==undefined) ? "font-size:":"size=";
                if(parseInt(fontsize)<14)
                    return fontStyleName+"2vh";
                else if(parseInt(fontsize)<=18)
                    return fontStyleName+"2.5vh";
                else
                    return fontStyleName+"3vh";
             });
            }
        let jqueryContent = $(result),
            h1Exist = false,
            ci = 0,
            contentBlock = $("<ul class='content-block'><li class='title-content'>Содержание</li></ul>");  
            jqueryContent.filter("h1").each(function(this: HTMLElement){
                let contentItem = $(this).find('b');
                if(!contentItem.length) return;
                $(this).attr('id', 'citem'+ci);
                contentBlock.append(`<li class='contentItem' id='${ci}'>${contentItem.text()}</li>`);
                h1Exist = true;
                ci++;
            });
            
        if(h1Exist)
            $("#maincontainer").append(contentBlock);
        else
            $("#maincontainer").find(".content-block").remove();
        //jqueryContent.slice(0).wrapAll("<div></div>");
        let wrapper = $("<div/>");
        wrapper.append(jqueryContent);
        console.log("wrapper", wrapper);
        setContent(wrapper.html());
            
        });
    }, [props.isAuth, id]);

    useEffect(()=>{
       
    }, [__content])

    useEffect(()=>{

        window.addEventListener('scroll', function(e: any) {
            var el = e.target;
            scrollValue = el.scrollTop;
          }, true);
          /*window.onbeforeunload = (event) => {
            const e = event || window.event;
            // Cancel the event
            e.preventDefault();
          }*/
          window.addEventListener("hashchange", function(e) {
            if(scrollValue>0){
                document.location.href = document.location.href;
                e.preventDefault();
                scrollValue = 0;
                window.scrollTo(0, 0);
            }
        }, false)
    }, [])

    return (
        <div className="container">
            <div className="row">
                <div className="pageWrapper" dangerouslySetInnerHTML={{__html:__content || ""}}></div>
            </div>
        </div>
    )
}

export default connect(mapStateToProps)(Content);