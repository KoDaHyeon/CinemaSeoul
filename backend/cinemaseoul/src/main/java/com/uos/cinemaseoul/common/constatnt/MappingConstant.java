package com.uos.cinemaseoul.common.constatnt;

public class MappingConstant {

    //로그인 없이 다 가능한 것들
    public static String[] All ={
            "/user/login",
            "/user/signup",
            "/user/login/non-member",
            "/user/phonecheck",
            "/user/emailcheck",
            "/user/findId",
            "/user/resetPw",

            "/admin/signup",
            "/admin/login",
            "/admin/phonecheck",
            "/admin/emailcheck",
            "/admin/findId",
            "/admin/resetPw",

            "/movie/{movi_id}",
            "/movie/search",
            "/movie/list",
            "/movie/genre/list",

            "/showschedule/list",

            "/book/movie",
            "/book/schedule",
    };

    //2 (비회원, 회원 둘다 가능)
    public static String[] NonUser = {
            "/adult",
            "/user/delete",

            "/book/list",
            "/book/{show_id}/seat",
            "/book/cancel/{book_id}",

            "/pay/book"
    };

    //1 (회원 가능)
    public static String[] User = {
            "/user",
            "/user/{user_id}",
            "/user/update",

            "/point/{user_id}/{start_date}",

            "/review"
    };

    //4 (직원 가능 = 매너지도 가능)
    public static String[] Admin = {
            "/user/blacklist",
            "/admin/{admi_id}",
            "/admin/update",

            "/movie/update",
            "/movie/updateGenre",
            "/movie/updateCast",
            "/movie/add",
            "/movie/delete",

            "/point/update",
            "/point/{user_id}/{start_date}",

            "/hall/{hall_id}",

            "/showschedule",
            "/showschedule/{show_id}/book",
            "/showschedule/add",

            "/book/list",
            "/book/{show_id}/seat",
    };

    //3 (매니저(높은 관리자만) 가능)
    public static String[] Manager = {
            "/admin/list",
            "/admin/delete",
            "/admin",

            "/hall",
            "/hall/seat"
    };
}
