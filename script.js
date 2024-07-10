let pledge_data = null
let character = null
const proficiencies_box = document.getElementById("proficiency-wrapper")
const container = document.getElementById("container")
const shadow = document.getElementById("shadow")
const style = document.createElement('style');
const physicalConditionBox = document.getElementById("physical-condition-container")
let listEaseTime = 800 // miliseconds
let list_shown = false
document.head.appendChild(style);


fetch("character.json").then(response => {return response.json()}).then(data => {
    character = data

    fetch("data.json").then(response =>{ return response.json() }).then(data => {
        pledge_data = data
    
        proficiency_types = []
        
        pledge_data["Work proficiency"].forEach(proficiency => {
            const proficiencyName = proficiency["Proficiency"]
            const characterSanity = character.Proficiencies["SANITY"]
            if (proficiencyName === "SANITY") {
                document.getElementById("SANITY").value = characterSanity
                updateSliderTrack(characterSanity,"SANITY")
                return
            }
            const professionProficiencyValue = find_stat(proficiencyName,character["Profession"],"Proficiencies")

            let characterProficiency = character.Proficiencies[proficiencyName]
            
            if (!characterProficiency) {
                character.Proficiencies[proficiencyName] = professionProficiencyValue || 0
            } else {
                if (characterProficiency > 5) {
                    character.Proficiencies[proficiencyName] = 5
                } 
                if (characterProficiency < professionProficiencyValue) {
                    character.Proficiencies[proficiencyName] = professionProficiencyValue
                }
            }

            category = proficiency["Category"]
            if (category && proficiency_types.includes(category) != true) {
                proficiency_types.push(category)
                proficiencies_box.append(create_category_element(category))
            }
        })

        pledge_data["Body Part Stats"].forEach(bodyPart => {
            physicalConditionBox.append(create_body_part_element(bodyPart))
            if (character["Physical Condition"][bodyPart["Body Part"]] != "disabled") {
                updateSliderTrack(character["Physical Condition"][bodyPart["Body Part"]],put_dash_between_name(bodyPart["Body Part"]))
            }
            
        })
    
        update_character_stats()
        show_list("Mental Condition")
    })
})


const create_category_element = (categoryName) => {
    categoryContainer = document.createElement("div")
    categoryContainer.classList.add("category")
    categoryContainer.classList.add(put_dash_between_name(categoryName))
    categoryContainer.id = put_dash_between_name(categoryName + "-container")
    categoryContainer.setAttribute("onclick",`javascript: show_category_list("${categoryName}")`)

    categoryContainer.innerHTML = `<p class="category-label">${categoryName}</p>`
    console.log(categoryContainer)
    return categoryContainer
}

const show_category_list = (categoryName) => {
    categoryList = document.getElementById(put_dash_between_name(categoryName) + "-list-container")
    if (categoryList) {
        categoryList.remove()
        return
    }

    categoryListContainer = document.createElement("div")
    categoryListContainer.classList.add("category-list-container")
    categoryListContainer.id = put_dash_between_name(categoryName) + "-list-container"
    document.getElementById(put_dash_between_name(categoryName + "-container")).after(categoryListContainer)


    pledge_data["Work proficiency"].forEach(proficiency => {
        if (proficiency["Category"] === categoryName) {
            proficiencyElement = create_proficiency_element(proficiency)
            categoryListContainer.append(proficiencyElement)
            proficiencyElement.value = character.Proficiencies[proficiency["Proficiency"]]
            updateSliderTrack(proficiencyElement.value, put_dash_between_name(proficiency["Proficiency"]))
        }
    })
    
}

/**
 * Creates a DOM element structure for a proficiency, including a title, a range input, and buttons to adjust the proficiency value.
 * @param {Object} proficiency - An object containing a 'Proficiency' key with the name of the proficiency as its value.
 * @returns {HTMLDivElement} - A div element containing the structured elements for the proficiency.*/
const create_proficiency_element = (proficiency) => {
    const proficiencyName = proficiency["Proficiency"];

    const proficiencyContainer = document.createElement("div");
    proficiencyContainer.className = "proficiency-container";
    proficiencyContainer.id = put_dash_between_name(proficiencyName) + "-container"

    const proficiencyMin = find_stat(proficiencyName, character["Profession"], "Proficiencies") || 0
    const proficiencyValue = character.Proficiencies[proficiencyName] || proficiencyMin
    const proficiencyID = put_dash_between_name(proficiencyName)
    const proficiencyNote = proficiency["Note"]

    proficiencyContainer.innerHTML = `
    <p class="proficiency-title" title="${proficiencyNote? proficiencyNote : ''}">${proficiencyName}</p>
    <input type="range" min="${proficiencyMin}" max="5" disabled id="${proficiencyID}" class="proficiency-input" value="${proficiencyValue}" >
    <div class="edit-prof-container">
        <button class="remove-prof-button" onclick="javascript:edit_prof('${proficiencyID}', -1)">-</button>
        <p class="prof-display" id="${proficiencyID}-display">0</p>
        <button class="add-prof-button" onclick="javascript: edit_prof('${proficiencyID}', 1)">+</button>
    </div>
    `

    return proficiencyContainer;
}

const create_body_part_element = (bodyPart) => {
    const bodyPartName = bodyPart["Body Part"] 
    const bodyPartContainer = document.createElement("div");
    bodyPartContainer.className = "proficiency-container body-part-container";
    bodyPartContainer.id = put_dash_between_name(bodyPartName) + "-container"

    const bodyPartID = put_dash_between_name(bodyPartName)
    const bodyPartValue = character["Physical Condition"][bodyPartName]

    bodyPartContainer.innerHTML = `
    <p class="proficiency-title">${bodyPartName}</p>
    <input type="range" min="${0}" 
    max="5" disabled id="${bodyPartID}" class="proficiency-input" value="${bodyPartValue}" >
    <div class="edit-prof-container">
        <button class="remove-prof-button" onclick="javascript:editBodyPart('${bodyPartID}', -1)">-</button>
        <p class="prof-display" id="${bodyPartID}-display">0</p>
        <button class="add-prof-button" onclick="javascript:editBodyPart('${bodyPartID}', 1)">+</button>
    </div>
    `
    if (bodyPartValue === "disabled") {
        bodyPartContainer.innerHTML = `
        <p class="proficiency-title">${bodyPartName}</p>
        <p class="disabled-text">DISABLED</p>
        `
    }
    
    return bodyPartContainer
}

// This will need to be fixed holy hell
const updateSliderTrack = (value, id) => {
    document.getElementById(id + "-display").textContent = value
    sheet = style.sheet;
    rules = sheet.cssRules || sheet.rules
    const rule = 
    `#${id}::-webkit-slider-runnable-track {
        width: 100%;
        cursor: pointer;
        background: linear-gradient(to right, lime ${value*20}%, red ${value*20}%);
        border-radius: 10px;
        border: none;
    }`;
    for (let i = 0; i <= rules.length; i++) {
        try {
            if (rules[i].selectorText.startsWith("#" + id)) {
            sheet.deleteRule(i);
            break;
            }
        } catch (TypeError) {
            break
        }
    }
    sheet.insertRule(rule, 0)
    // Insert the new rule
    ;
}

const edit_prof = (id, value) => {
    proficiencyInput = document.getElementById(id) 
    proficiencyInput.value = parseInt(proficiencyInput.value) + value
    character.Proficiencies[id.replace("-", " ")] = parseInt(proficiencyInput.value)
    updateSliderTrack(proficiencyInput.value,id)
    update_character_stats()
}

const editBodyPart = (id, value) => {
    bodyPartInput = document.getElementById(id) 
    bodyPartInput.value = parseInt(bodyPartInput.value) + value
    character["Physical Condition"][id.replace("-", " ")] = parseInt(bodyPartInput.value)
    updateSliderTrack(bodyPartInput.value,id)
    update_character_stats()
}

const find_stat = (stat, type, category) => {
    return pledge_data[category].find(element => element[category] === type)[stat]
}

/**
 * Converts spaces in a given string to dashes, suitable for use as an HTML element ID.
 * @param {string} id - The input string that may contain spaces.
 * @returns {string} - The transformed string with spaces replaced by dashes.
 */
const put_dash_between_name = (id) => {
    return id.replace(" ", "-")
}

const handleEnter = (event) => {
    if (event.key === "Enter") {
        close_list()
    }
}

/**
 * 
 * @param {String} category 
 * @returns {null}
 */
const show_list = (category) => {
    if (list_shown === false) {
        list_shown = true
        list = document.createElement("div")
        list.id = "list-container"
        list.style.animation = `ease-down ${listEaseTime/1000}s ease forwards`

        
        setTimeout(() => {
            list.style.animation = ""
            document.addEventListener("keypress", handleEnter)
            shadow.addEventListener("click",close_list)
        }, listEaseTime);

        shadow.style.transition = `all ease ${listEaseTime/2000}s`
        shadow.style.opacity = "80%"
        shadow.style.zIndex = "1"

        list.innerHTML = `<p id="list-label">${category}</p>`
        container.append(list)

        const contentContainer = document.createElement("div")
        list.append(contentContainer)

        if (category === "Ancestry") {
            contentContainer.id = "ancestries-wrapper"
            const SpellMod = character["Spell Attack Modifier"]
            console.log(SpellMod)
            pledge_data["Ancestry"].forEach(Ancestry => {
                AncestryName = Ancestry["Ancestry"]
                AncestrySkills = Ancestry["Skill"].split("<br><br>").map(skill => skill.split(":")[0].replace("  ", ""))
                AncestrySkillDescription = Ancestry["Skill"].split("<br><br>").map(skill => skill.split(":")[1].replace("  ", ""))
                contentContainer.innerHTML += `
                <div id=${AncestryName}-container class="ancestry-container" onclick='javascript:change_stat("${AncestryName}","Ancestry")'>
                    <p class="ancestry-title">${AncestryName}</p>
                    <img src="assets/Ancestries/${AncestryName}.png" alt="Picture of ${AncestryName}" class="ancestry-img">
                    <table border="1" class="ancestry-stat-table">
                        <tr class="ancestry-stat-label">
                            <th ${SpellMod === "Strength"? 'title = "Spell Attack Modifier" class="ancestry-label spellmod-stat"' : 'class="ancestry-label"'}>STR</th>
                            <th ${SpellMod === "Agility"? 'title = "Spell Attack Modifier" class="ancestry-label spellmod-stat"' : 'class="ancestry-label"'}>AGI</th>
                            <th ${SpellMod === "Intellect"? 'title = "Spell Attack Modifier" class="ancestry-label spellmod-stat"' : 'class="ancestry-label"'}>INT</th>
                            <th ${SpellMod === "Will"? 'title = "Spell Attack Modifier" class="ancestry-label spellmod-stat"' : 'class="ancestry-label"'}>WIL</th>
                            <th ${SpellMod === "Sociability"? 'title = "Spell Attack Modifier" class="ancestry-label spellmod-stat"' : 'class="ancestry-label"'}>SCB</th>
                        </tr>
                        <td ${SpellMod === "Strength"? 'title = "Spell Attack Modifier (based on profession)" class="ancestry-stat spellmod-stat"' : 'class="ancestry-stat"'} >+${Ancestry["Strength"]}</td>  
                        <td ${SpellMod === "Agility"? 'title = "Spell Attack Modifier (based on profession)" class="ancestry-stat spellmod-stat"' : 'class="ancestry-stat"'} >+${Ancestry["Agility"]}</td>
                        <td ${SpellMod === "Intellect"? 'title = "Spell Attack Modifier (based on profession)" class="ancestry-stat spellmod-stat"' : 'class="ancestry-stat"'} >+${Ancestry["Intellect"]}</td>
                        <td ${SpellMod === "Will"? 'title = "Spell Attack Modifier (based on profession)" class="ancestry-stat spellmod-stat"' : 'class="ancestry-stat"'} >+${Ancestry["Will"]}</td>
                        <td ${SpellMod === "Sociability"? 'title = "Spell Attack Modifier (based on profession)" class="ancestry-stat spellmod-stat"' : 'class="ancestry-stat"'} >+${Ancestry["Sociability"]}</td>                      
                    </table>
                    <div class="ancestry-skill-container">
                        <p class="ancestry-skill-label">Skills</p>
                        <div class="ancestry-skill-wrapper">
                            <p class="ancestry-skill" title="${AncestrySkillDescription[0]}">${AncestrySkills[0]}</p>
                            <p class="ancestry-skill" title="${AncestrySkillDescription[1]}">${AncestrySkills[1]}</p>
                        </div>
                    </div>
                    <p class="ancestry-view-more" id="${AncestryName}-selected">${AncestryName === character["Ancestry"]? 'SELECTED' : ''}</p>
                </div>
                `
            })
        }
        
        if (category === "Profession") {
            contentContainer.id = "profession-wrapper"
            pledge_data["Professions"].forEach(profession => {
                const professionName = profession["Professions"]
                const professionSkill = profession["Skill"].split(":")[0]
                const SpellMod = profession["Spell Attack Modifier"]
                contentContainer.innerHTML += `
                <div class="profession-container" onclick="javascript:change_stat('${professionName}','Profession')">
                    <div class="profession-main-container">
                        <img src="" alt="Picture of ${professionName}" class="profession-img">
                        <p class="profession-label">${professionName}</p>    
                    </div>
                    <div class="profession-info-container">
                        <table border="1" class="profession-stat-table">
                        <tr class="ancestry-stat-label">
                            <th ${SpellMod === "Strength"? 'title = "Spell Attack Modifier" class="ancestry-label spellmod-stat"' : 'class="ancestry-label"'}>STR</th>
                            <th ${SpellMod === "Agility"? 'title = "Spell Attack Modifier" class="ancestry-label spellmod-stat"' : 'class="ancestry-label"'}>AGI</th>
                            <th ${SpellMod === "Intellect"? 'title = "Spell Attack Modifier" class="ancestry-label spellmod-stat"' : 'class="ancestry-label"'}>INT</th>
                            <th ${SpellMod === "Will"? 'title = "Spell Attack Modifier" class="ancestry-label spellmod-stat"' : 'class="ancestry-label"'}>WIL</th>
                            <th ${SpellMod === "Sociability"? 'title = "Spell Attack Modifier" class="ancestry-label spellmod-stat"' : 'class="ancestry-label"'}>SCB</th>
                            <th class="ancestry-label">MP</th>
                        </tr>
                        <td ${SpellMod === "Strength"? 'title = "Spell Attack Modifier" class="ancestry-stat spellmod-stat"' : 'class="ancestry-stat"'}> ${profession["Strength"] >= 0? "+" : ""}${profession["Strength"]}</td>  
                        <td ${SpellMod === "Agility"? 'title = "Spell Attack Modifier" class="ancestry-stat spellmod-stat"' : 'class="ancestry-stat"'}> ${profession["Agility"] >= 0? "+" : ""}${profession["Agility"]}</td>
                        <td ${SpellMod === "Intellect"? 'title = "Spell Attack Modifier" class="ancestry-stat spellmod-stat"' : 'class="ancestry-stat"'}> ${profession["Intellect"] >= 0? "+" : ""}${profession["Intellect"]}</td>
                        <td ${SpellMod === "Will"? 'title = "Spell Attack Modifier" class="ancestry-stat spellmod-stat"' : 'class="ancestry-stat"'}> ${profession["Will"] >= 0? "+" : ""}${profession["Will"]}</td>
                        <td ${SpellMod === "Sociability"? 'title = "Spell Attack Modifier" class="ancestry-stat spellmod-stat"' : 'class="ancestry-stat"'}> ${profession["Sociability"] >= 0? "+" : ""}${profession["Sociability"]}</td>   
                        <td class="ancestry-stat">${profession["MP"] >= 0? "+" : ""}${profession["MP"]}</td>                      
                        </table>
                        <div class="profession-skill-container">
                            <p class="profession-skill-label">Skill</p>
                            <p class="profession-skill">${professionSkill}</p>
                        </div>
                        <p id="${professionName}-selected" class="profession-selected">${character["Profession"] === professionName? "SELECTED": ""}</p>
                    </div>
                </div>
                `
            })
        }
        
        if (category === "Pledge") {
            contentContainer.id = "pledge-wrapper"
            pledge_data["Pledge"].forEach(pledge => {
                const pledgeName = pledge["Pledge"]
                const pledgeTitle = pledge["Pledge Title"]
                contentContainer.innerHTML += `
                <div class="pledge-container" onclick="javascript: change_stat('${pledgeName}','Pledge')"> 
                    <p class="pledge-name">${pledgeName}</p>
                    <p class="pledge-title">${pledgeTitle}</p>
                    <img src="" alt="Picture of ${pledgeName}" class="pledge-img">
                    <p class="pledge-selected" id="${pledgeName}-selected">${character["Pledge"] === pledgeName? "SELECTED": ""}</p>
                </div>
                `
            })
        }

        if (category === "Mental Condition") {
            contentContainer.id = "mental-condition-wrapper"
            pledge_data["Mental"]
        }

        if (category === "Inventory") {
            contentContainer.innerHTML = "im broke :("
        }
        document.querySelectorAll(`.${category.toLowerCase()}-container`).forEach(containerElement => {
            containerElement.addEventListener("mousedown", () => {
                containerElement.style.transform = "translateY(0px)"
            })
            containerElement.addEventListener("mouseup", () => {
                containerElement.style.transform = "translateY(-10px)"
            })
            containerElement.addEventListener("mouseover", () => {
                containerElement.style.transform = "translateY(-10px)"
            })
            containerElement.addEventListener("mouseleave", () => {
                containerElement.style.transform = "translateY(0px)"
            })
            console.log("yay")
    })
    }
}

const change_stat = (value, stat) => {
    document.getElementById(character[stat] + "-selected").textContent = ""
    character[stat] = value
    document.getElementById(character[stat] + "-selected").textContent = "SELECTED"
    update_character_stats()
}

const close_list = () => {
    list = document.getElementById("list-container")
    list.style.animation = ""
    list.style.animation = `ease-up ${listEaseTime/1000}s ease forwards`
    shadow.style.opacity = "0%"
    shadow.style.zIndex = "-1"
    shadow.removeEventListener("click",close_list)
    document.removeEventListener("keypress", handleEnter)
    setTimeout(() => {
        list.style.animation = ""
        container.removeChild(list)
        list_shown = false
    }, listEaseTime);
}

function countSyllables(word) {
    word = word.toLowerCase();

    const vowels = "aeiouy";

    word = word.replace(/[^a-z]/g, "");

    if (word.length === 0) return 0;
    if (word.length === 1) return vowels.includes(word) ? 1 : 0;

    if (word.endsWith('e')) {
        word = word.slice(0, -1);
    }

    let syllableCount = 0;
    let isPrevCharVowel = false;
    console.log(word)
    for (let i = 0; i < word.length; i++) {
        if (vowels.includes(word[i])) {
            if (!isPrevCharVowel) {
                syllableCount++;
                isPrevCharVowel = true;
            }
        } else {
            isPrevCharVowel = false;
        }
    }

    if (syllableCount === 0) {
        syllableCount = 1;
    }

    return syllableCount;
}

const random_character = () => {
    const get_random = (Array) => {
        return Array[Math.floor(Math.random()*Array.length)]
    }
    const Ancestries = ["Human", "Ork", "Dwarf","Fairy","Goblin"]
    const Professions = pledge_data["Professions"].map(object => object["Professions"])
    const Pledge = pledge_data["Pledge"].map(object => object["Pledge"])

    return {
        "Profession": get_random(Professions),
        "Ancestry": get_random(Ancestries),
        "Pledge": get_random(Pledge),
    }
}

const update_character_stats = () => {
    document.getElementById("character-name").value = character["Name"]
    document.getElementById("profession").textContent = character["Profession"]
    document.getElementById("pledge").textContent = character["Pledge"]
    document.getElementById("ancestry").textContent = character["Ancestry"]
    document.getElementById("mental-condition").textContent = character["Mental Condition"]
    document.getElementById("SANITY").value = character.Proficiencies["SANITY"]
    document.getElementById("pledge-title").textContent = "Follower of " + find_stat("Pledge Title",character["Pledge"], "Pledge")
    character["Spell Attack Modifier"] = pledge_data["Professions"].find(profession => profession["Professions"] === character["Profession"])["Spell Attack Modifier"]

    stats = ["Strength", "Agility", "Intellect", "Will", "Sociability", "MP"]
    stats.forEach(stat => {
        proficiencyBoost = 0
        pledge_data["Work proficiency"].filter(element => element["Stat Boost"] === stat).forEach(proficiency => {
            proficiencyBoost += parseInt(character.Proficiencies[proficiency["Proficiency"]])
        })
        
        bodyPartReducts = 0
        bodyPartValue = 5
        pledge_data["Body Part Stats"].filter(element => element["Stat Reducts"].split(" ").includes(stat)).forEach(bodyPart => {
            const bodyPartName = bodyPart["Body Part"]
            if (character["Physical Condition"][bodyPartName] != "disabled") {
                bodyPartValue = character["Physical Condition"][bodyPartName]
            } else {
                bodyPartValue = 0
            }
            bodyPartReducts += (5 - bodyPartValue)
        })

        if (character["Proficiencies"]["SANITY"] <= 0) {
            character["Mental Condition"] = "Insane"
        } else {
            character["Mental Condition"] = "Neutral"
        }
        if (stat === "MP") {
            spellAttackModifier = 0 
            if (find_stat("Spell Attack Modifier",character["Profession"],"Professions") != "None") {
                spellAttackModifier = character[find_stat("Spell Attack Modifier",character["Profession"],"Professions")]
            }
            // Total MP = Profession + Profession Spell Attack Modifier + Magic Proficiency + Will / 2
            character[stat] = Math.floor(
            find_stat("MP",character["Profession"],"Professions") + 
            spellAttackModifier + 
            proficiencyBoost +
            character["Will"]/2
            )

        } else {
            // Normal Stat =  SANITY / 2 + Work prof points / 2 + Ancestry + Physical + Mental + Profession  
            character[stat] = 
            (character.Proficiencies["SANITY"] - 5) +
            (proficiencyBoost) +
            find_stat(stat,character["Ancestry"],"Ancestry") + 
            find_stat(stat,character["Mental Condition"],"Mental Condition") + 
            find_stat(stat,character["Profession"],"Professions") -
            (bodyPartReducts / 2)
        }        

        document.getElementById(stat).textContent = character[stat]
        if (stat === character["Spell Attack Modifier"]) {
            document.getElementById(stat).classList.add("spellmod-stat")
            document.getElementById(stat).title = "Spell Attack Modifier (based on profession)"
        } else {
            document.getElementById(stat).classList.remove("spellmod-stat")
            document.getElementById(stat).title = ""
        }
    });

    // Skills Check and Saving Throws 
    skillsCheck = document.getElementById("skills-check")
    ancestrySkillHeader = document.getElementById("ancestry-skills-header")
    ancestrySkillParagraph = document.getElementById("ancestry-skills-paragraph")
    professionSkillsHeader = document.getElementById("profession-skills-header")
    professionSkillsParagraph = document.getElementById("profession-skills-paragraph")

    ancestrySkillHeader.innerHTML = `
        ${character["Ancestry"]} Skills: <br>
    `
    ancestrySkillParagraph.innerHTML = `
        ${find_stat("Skill", character["Ancestry"],"Ancestry")} <br> 
        <br>
    `
    professionSkillsHeader.innerHTML = `
        ${character["Profession"]} Skills and Checks: <br>
    `
    professionSkillsParagraph.innerHTML = `
        ${find_stat("Skill", character["Profession"], "Professions")} <br> 
        <br>
        ${find_stat("Check", character["Profession"], "Professions")} <br> 
        <br>
        Saving Throws: ${find_stat("Saving Throws", character["Profession"], "Professions")}
    `
}

document.getElementById('character-image-input').addEventListener('change', function() {
    var fileName = document.getElementById('fileName');
    var input = this;
    var fileContent = document.getElementById('character-image');

    if (input.files.length > 0) {
        var file = input.files[0];
        fileName.textContent = file.name;

        var reader = new FileReader();
        reader.onload = function(e) {
            // Clear any previous content
            fileContent.innerHTML = '';

            // Create an img element and set its src to the file data
            var img = document.createElement('img');
            img.src = e.target.result;
            img.id = "character-image-file"
            fileContent.appendChild(img);
        };

        reader.onerror = function(e) {
            fileContent.textContent = "Error reading file";
        };

        reader.readAsDataURL(file); 
    } else {
        fileName.textContent = 'No file chosen';
        fileContent.textContent = '';
    }
});

// This is for the future "Export Character" function 
let characterSaved = true
window.addEventListener('beforeunload', function (event) {
    if (!characterSaved) {
        event.preventDefault();
    }
    event.returnValue = '';
})