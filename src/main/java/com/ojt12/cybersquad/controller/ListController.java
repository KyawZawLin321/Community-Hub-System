//package com.ojt12.cybersquad.controller;
//
//import com.ojt12.cybersquad.model.User;
//import com.ojt12.cybersquad.repository.ListRepository;
//import com.ojt12.cybersquad.service.ListService;
//import com.ojt12.cybersquad.service.UserService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.stereotype.Controller;
//import org.springframework.ui.Model;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//
//@Controller
//public class ListController {
//    @Autowired
//    private UserService userService;
//
//    @Autowired
//    private ListRepository listRepository;
//
//    @Autowired
//    private ListService listService;
//
//    @GetMapping("/resource")
//    public String showCreateListForm(Model model) {
//        String staffId = SecurityContextHolder.getContext().getAuthentication().getName();
//        User userExist = userService.findByStaffId(staffId);
//        java.util.List<List> lists = listService.getListsByUserId(userExist.getId());
//        model.addAttribute("lists", lists);
//        model.addAttribute("listBean", new List());
//        return "resource";
//    }
//
//    @PostMapping("/createList")
//    public String createList(@RequestParam("description") String description, Model model) {
//        String staffId = SecurityContextHolder.getContext().getAuthentication().getName();
//        User userExist = userService.findByStaffId(staffId);
//
//        List list = new List();
//        list.setDescription(description);
//        list.setStatus(true);
//        list.setUserId(userExist.getId());
//
//        listRepository.save(list);
//
//        // Reload the list data after saving
//        java.util.List<List> lists = listService.getListsByUserId(userExist.getId());
//        model.addAttribute("lists", lists);
//
//        return "redirect:/resource"; // Redirect to avoid resubmission on refresh
//    }
//
////    @GetMapping("/list/{listId}")
////    public String ListViewPage(@PathVariable("listId") int listId, Model model) {
////        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
////        User user = userService.findByStaffId(auth.getName());
////
////        java.util.List<List> lists = listService.getListsByUserId(user.getId());
////
////        // Convert List entities to DTOs if necessary
////        java.util.List<ListDto> listDtos = lists.stream()
////                .map(list -> new ListDto(
////                        list.getId(),
////                        list.getDescription(),
////                        list.isStatus(),
////                        list.getUserId()
////                ))
////                .collect(Collectors.toList());
////
////        model.addAttribute("lists", listDtos);
////        UserDto userDto = new UserDto(user.getStaffId(), user.getName(), user.getDepartment(), user.getTeam(), user.getRole(), user.getPhoto(), user.getId());
////        model.addAttribute("user", userDto);
////
////        return "listView"; // Assuming your Thymeleaf template is named listView.html
////    }
//
//}
