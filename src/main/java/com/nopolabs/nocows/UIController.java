package com.nopolabs.nocows;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping(value = "/")
public class UIController {

    UIController() {
    }

    @GetMapping("/solve")
    public String solve() {
        return "solve";
    }

    @GetMapping
    public String get() {
        return "index";
    }
}
