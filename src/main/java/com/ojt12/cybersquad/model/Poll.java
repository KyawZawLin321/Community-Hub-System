package com.ojt12.cybersquad.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "poll")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Poll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(nullable = true)
    private String question;
    @Column(nullable = true)
    private String isPublic;
    private LocalDateTime createdDate;
    private LocalDateTime endDate;
    private boolean status;

    @Transient
    private int userId; // Transient field to hold userId

    @Transient
    private List<String> optionTexts;

    @Transient
    private List<Integer> optionId;

    @Transient
    private int groupId;


    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "group_id")
    private Groups groups;

    @JsonManagedReference
    @OneToMany(mappedBy = "poll", cascade = CascadeType.PERSIST)
    private List<OptionList> optionList;


    public void setOptionTexts(List<OptionList> optionLists) {
        this.optionTexts = optionLists.stream()
                .filter(optionList -> optionList.getOptionText() != null)
                .map(OptionList::getOptionText)
                .collect(Collectors.toList());
    }

    public void setOptionId(List<OptionList> optionLists) {
        this.optionId = optionLists.stream()
                .filter(optionList -> optionList.getId() != 0)
                .map(OptionList::getId)
                .collect(Collectors.toList());
    }



    @Transient
    private int[] optionCounts;

    @Transient
    private int totalVotes;


}
