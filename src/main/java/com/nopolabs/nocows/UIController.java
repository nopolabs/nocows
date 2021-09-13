package com.nopolabs.nocows;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Random;

@Controller
@RequestMapping(value = "/")
public class UIController {

    private static final Logger LOG = LoggerFactory.getLogger(UIController.class);

    private final Bee bee;

    UIController(Bee bee) {
        this.bee = bee;
    }

    @GetMapping
    public String get(Model model) {

        String hive = bee.getHive();

        model.addAttribute("hive", hive);

        return "index";
    }
}
