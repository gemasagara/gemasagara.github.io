---
title: International Robotics Competition Entry
date: 2025-03-15
category: Robotics
author: Gema Sagara
tagline: Building an autonomous robot that navigated complex obstacle courses and performed precision tasks.
published: true
link: ../resources/SCN_W8.pdf
---

## Project Overview
## WowzerRRRR

Our team designed and built an autonomous robot for the International Robotics Competition 2025. The robot was required to navigate through a complex obstacle course, identify and collect specific objects, and place them in designated areas - all while competing against the clock and other teams from around the world.

## Technical Specifications

- **Microcontroller**: Arduino Mega 2560 with custom shield
- **Motors**: 4x Brushless DC motors with high-precision encoders
- **Sensors**: 
  - 2x LIDAR sensors for obstacle detection and mapping
  - RGB camera for object identification
  - Ultrasonic sensors for short-range detection
  - IMU (Inertial Measurement Unit) for position tracking
- **Power System**: 11.1V LiPo battery with custom power management system
- **Construction**: Custom aluminum frame with 3D printed components
- **Software**: Custom navigation algorithms written in C++ with machine learning object recognition

## Development Process

### Planning and Design Phase

The competition presented several challenges that required careful planning and innovative solutions. We began by breaking down the competition requirements and identifying the key technical challenges:

1. Autonomous navigation in an unknown environment
2. Object recognition and classification
3. Precision manipulation of objects
4. Robust error handling and recovery

Our design process involved multiple iterations of prototyping, from simple cardboard mockups to CAD designs and finally the physical build.

### Build Process

Construction took approximately six weeks, with team members working in parallel on different subsystems:

- Mechanical team focused on the chassis, drive system, and manipulator arm
- Electronics team developed the sensor integration and power systems
- Software team worked on navigation algorithms and object recognition

We encountered several challenges during the build, particularly with weight distribution affecting the robot's stability and sensor interference requiring custom shielding solutions.

### Testing and Refinement

Testing was conducted in phases:

1. Component testing to verify individual subsystems
2. Integration testing to ensure all systems worked together
3. Field testing in simulated competition environments
4. Stress testing to identify failure points and improve reliability

Each testing phase revealed opportunities for improvement. We made significant modifications to our object recognition system after discovering performance issues in varying lighting conditions.

## Competition Results

Our team placed 3rd overall in the competition, with particularly strong scores in the autonomous navigation portion. The judges commended our innovative approach to object recognition using a hybrid of contour analysis and machine learning classification.

The most challenging aspect proved to be the final precision placement task, where slight calibration issues in our manipulator arm cost us valuable points.

## What We Learned

This project provided invaluable hands-on experience in:

- Systems integration in complex robotics projects
- Real-time sensor fusion and decision making
- Team collaboration across mechanical, electrical and software disciplines
- Iterative design and rapid prototyping techniques
- Performance optimization under strict constraints

## Future Improvements

For future iterations, we've identified several improvements:

1. Implementing more advanced path planning algorithms
2. Upgrading to a more powerful onboard computer for real-time image processing
3. Developing a more precise manipulation system with feedback control
4. Creating a more modular design to allow rapid reconfiguration for different challenges

This project represents hundreds of hours of collaborative work and problem-solving, resulting in a sophisticated autonomous system that performed admirably under competition conditions.