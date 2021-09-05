package com.nopolabs.nocows;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping(value = "/")
public class UIController {

    @GetMapping
    public String get(Model model) {

        model.addAttribute("hive", "abcdefg");

        return "index";
    }
}
