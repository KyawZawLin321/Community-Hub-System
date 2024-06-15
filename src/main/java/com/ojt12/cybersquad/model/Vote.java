package com.ojt12.cybersquad.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// kym //

@Entity
@Table(name = "vote")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private int num;

    @ManyToOne
   // @JsonBackReference
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
  //  @JsonBackReference
    @JoinColumn(name = "option_id")
    private OptionList optionList;
}
// kym //