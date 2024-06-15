package com.ojt12.cybersquad.service;

import com.ojt12.cybersquad.model.User;
import com.ojt12.cybersquad.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/*KZL*/

    @Service
    @Transactional
    public class ExcelUploadService {
        @Autowired
        public UserRepository userRepository;
        @Autowired
        private PasswordEncoder passwordEncoder;
        @Autowired
        private UserService userService;
        @Value("${cloudinary.excel.url}")
        private String cloudinaryExcelUrl;
        public  boolean isValidExcelFile(MultipartFile file) {
        return Objects.equals(file.getContentType(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }
        @PostConstruct
        public void autoUploadExcel() {
            ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
            System.out.println(cloudinaryExcelUrl);
            System.out.println("hehe");
            // Calculate initial delay until next Saturday 10 p m
            long initialDelay = calculateInitialDelay();
            System.out.println(initialDelay);
            System.out.println(TimeUnit.MILLISECONDS.convert(1, TimeUnit.DAYS));
            System.out.println(TimeUnit.MILLISECONDS);
            // Schedule the task to run every 7 days (weekly) after the initial delay
            scheduler.scheduleAtFixedRate(this::getUsersDataFromExcel, initialDelay, TimeUnit.MILLISECONDS.convert(1, TimeUnit.DAYS), TimeUnit.MILLISECONDS);
        }

        private long calculateInitialDelay() {
            // Get current day of the week
            Calendar now = Calendar.getInstance();
            int currentDayOfWeek = now.get(Calendar.DAY_OF_WEEK);

            // Calculate the number of days until next Saturday
            int daysUntilNextSaturday = (Calendar.MONDAY - currentDayOfWeek + 7) % 7;

            // Set the time to 10 pm
            Calendar nextSaturday = (Calendar) now.clone();
            nextSaturday.add(Calendar.DAY_OF_MONTH, daysUntilNextSaturday);
            nextSaturday.set(Calendar.HOUR_OF_DAY, 11); // 10 pm
            nextSaturday.set(Calendar.MINUTE,30);
            nextSaturday.set(Calendar.SECOND, 0);
            nextSaturday.set(Calendar.MILLISECOND, 0);

            // Calculate the delay until next Saturday 10 pm
            long delayInMillis = nextSaturday.getTimeInMillis() - now.getTimeInMillis();
            if (delayInMillis < 0) {
                // If the calculated delay is negative, add 7 days to go to next Saturday
                delayInMillis += TimeUnit.DAYS.toMillis(7);
            }

            return delayInMillis;
        }
    public  List<User> getUsersDataFromExcel() {
        System.out.println(cloudinaryExcelUrl);
        List<User> users = new ArrayList<>();
        try {
            InputStream inputStream = new URL(cloudinaryExcelUrl).openStream();
            XSSFWorkbook workbook = new XSSFWorkbook(inputStream);
            XSSFSheet sheet = workbook.getSheet("Employee_Data");
            if (sheet != null) {

                int rowIndex = 0;
                for (Row row : sheet) {
                    if (rowIndex == 0) {
                        rowIndex++;
                        continue;
                    }
                    Iterator<Cell> cellIterator = row.iterator();
                    int cellIndex = 0;
                    User user = new User();
                    while (cellIterator.hasNext()) {
                        Cell cell = cellIterator.next();
                        switch (cellIndex) {
                            case 0 : user.setId((int) cell.getNumericCellValue());
                                break;
                            case 1 : user.setDivision(cell.getStringCellValue());
                                break;
                            case 2 : user.setStaffId(cell.getStringCellValue());
                                break;
                            case 3 : user.setName(cell.getStringCellValue());
                                break;
                            case 4 : user.setDoorLogId((int) cell.getNumericCellValue());
                                break;
                            case 5 : user.setDepartment(cell.getStringCellValue());
                                break;
                            case 6 : user.setTeam(cell.getStringCellValue());
                                break;
                            case 7 : user.setEmail(cell.getStringCellValue());
                                break;
                            case 8 : user.setCreateDate(cell.getStringCellValue());
                                break;
                            default :{
                            }
                        }
                        cellIndex++;
                    }
            User user1=userService.findByStaffId(user.getStaffId());
                if(user1!=null){
            if(!user1.getName().equals(user.getName())){
                user1.setName(user.getName());
            }else if(!user1.getDepartment().equals(user.getDepartment())){
                user1.setDepartment(user.getDepartment());
            }else if(!user1.getTeam().equals(user.getTeam())){
                user1.setTeam(user.getTeam());
            }else if(!user1.getDivision().equals(user.getDivision())){
                user1.setDivision(user.getDivision());
            }else if(user1.getDoorLogId()!=user.getDoorLogId()){
                user1.setDoorLogId(user.getDoorLogId());
            }
            users.add(user1);
        }else{
            user.setPassword(passwordEncoder.encode("123@dat"));
            users.add(user);
        }

                }
                workbook.close();
                userRepository.saveAll(users);
                // Update employee status in the database
                updateEmployeeStatus(users);
            } else {
                System.out.println("Sheet named 'Employee_Data' not found in the workbook.");
            }
        } catch (IOException e) {
            e.getStackTrace();
        }
        return users;
    }
    public  void updateEmployeeStatus(List<User> usersFromExcel) {
        List<String> employeeIdsFromExcel = usersFromExcel.stream().map(User::getStaffId).toList();
        List<User> employeesFromDatabase = userRepository.findAll(); // Assuming userRepository is your repository for User entity

        for (User employee : employeesFromDatabase) {
            // Check if the employee ID from the database is not present in the Excel file
            if(employee.getRole().name().equals("Admin")) {
                employee = userService.findByStaffId(employee.getStaffId());
                employee.setStatus(true);
                userRepository.save(employee);
            }else {
                if(!employeeIdsFromExcel.contains(employee.getStaffId())) {
                    employee= userService.findByStaffId(employee.getStaffId());
                    employee.setStatus(false);
                    userRepository.save(employee);
                }else{
                    employee.setStatus(true);
                    userRepository.save(employee);
                }

            }
        }


    }
    /*KZL*/

}