# 7 DoF Robot Arm
![blue arm](pictures/blue_arm.jpg)

## Joints

### Planetary Gear Joint
[Gravity compensation for planetary gear joint](https://yannickkoster.github.io/gravity-compensation-robotarm/planetary_gear_module)

### Belt Joint
[Gravity compensation for belt joint](https://yannickkoster.github.io/gravity-compensation-robotarm/belt_module.html)

### Differential Joint
[Gravity compensation for differential joint](https://yannickkoster.github.io/gravity-compensation-robotarm/differential_module.html)

### Kinematics
```
Phi_1 = K_1 * (Phi_m1 + Phi_m2) / 2
Phi_2 = K_2 * (Phi_m1 - Phi_m2) / 2
K_1, K_2 = constants determined by gearing (belt and bevel gear)
```

#### Advantages
- Motors close to base (lower arm inertia)
- Partial load sharing

#### Disadvantages
